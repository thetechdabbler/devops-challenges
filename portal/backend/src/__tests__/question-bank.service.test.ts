import { Topic, ExperienceLevel } from '@prisma/client'

jest.mock('../repositories/question.repository')
jest.mock('../repositories/user-question-history.repository')
jest.mock('../lib/question-bank/ai-generator', () => ({
  aiQuestionGenerator: { generate: jest.fn() },
}))

import { questionBankService } from '../services/question-bank.service'
import { questionRepository } from '../repositories/question.repository'
import { userQuestionHistoryRepository } from '../repositories/user-question-history.repository'
import { aiQuestionGenerator } from '../lib/question-bank/ai-generator'
import { QuestionSummary, GeneratedQuestion } from '../lib/question-bank/types'

const mockFindByConfig = questionRepository.findByConfig as jest.MockedFunction<typeof questionRepository.findByConfig>
const mockFindById = questionRepository.findById as jest.MockedFunction<typeof questionRepository.findById>
const mockSaveGenerated = questionRepository.saveGenerated as jest.MockedFunction<typeof questionRepository.saveGenerated>
const mockFindRecentIds = userQuestionHistoryRepository.findRecentIds as jest.MockedFunction<typeof userQuestionHistoryRepository.findRecentIds>
const mockRecordSeen = userQuestionHistoryRepository.recordSeen as jest.MockedFunction<typeof userQuestionHistoryRepository.recordSeen>
const mockGenerate = aiQuestionGenerator.generate as jest.MockedFunction<typeof aiQuestionGenerator.generate>

function makeQuestion(id: string, type: 'theory' | 'scenario' = 'theory'): QuestionSummary {
  return {
    id,
    text: `Question ${id}`,
    type,
    topics: [Topic.Docker],
    difficulty: 2,
    experienceLevel: ExperienceLevel.junior,
    source: 'bank',
    status: 'active',
    createdAt: new Date(),
  }
}

function makeGenerated(text: string): GeneratedQuestion {
  return {
    text,
    type: 'theory',
    topics: [Topic.Docker],
    difficulty: 2,
    experienceLevel: ExperienceLevel.junior,
    answer: 'answer',
    explanation: 'explanation',
    keyConcepts: ['concept'],
  }
}

// count=5 is the session minimum and the smallest count where 2+2 mix is feasible
const config = {
  topics: [Topic.Docker],
  difficulty: 2,
  experienceLevel: ExperienceLevel.junior,
  count: 5,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRecordSeen.mockResolvedValue(undefined)
})

describe('questionBankService.getQuestionsForSession — bank-only', () => {
  it('returns bank questions when count is satisfied, gapCount = 0', async () => {
    // Provide 6 questions with satisfied mix (3 theory + 3 scenario) so no type gap-fill is triggered
    const mixed = [
      makeQuestion('q1', 'theory'), makeQuestion('q2', 'theory'), makeQuestion('q3', 'theory'),
      makeQuestion('q4', 'scenario'), makeQuestion('q5', 'scenario'), makeQuestion('q6', 'scenario'),
    ]
    mockFindByConfig.mockResolvedValueOnce(mixed)
    mockFindRecentIds.mockResolvedValueOnce(new Set())

    const result = await questionBankService.getQuestionsForSession(config, 7)

    expect(result.questions).toHaveLength(5)
    expect(result.gapCount).toBe(0)
    expect(mockGenerate).not.toHaveBeenCalled()
    expect(mockRecordSeen).toHaveBeenCalledWith(7, expect.arrayContaining([expect.any(String)]))
  })

  it('filters recently seen questions', async () => {
    mockFindByConfig.mockResolvedValueOnce(['q1', 'q2', 'q3'].map(id => makeQuestion(id)))
    mockFindRecentIds.mockResolvedValueOnce(new Set(['q1', 'q2']))
    // After dedup: 1 question remains; count gap=4, type gaps also fire (non-fatal, no mock needed)

    const result = await questionBankService.getQuestionsForSession(config, 7)

    expect(result.questions).toHaveLength(1)
    expect(result.questions[0].id).toBe('q3')
    expect(result.gapCount).toBe(4)
  })
})

describe('questionBankService.getQuestionsForSession — hybrid (gap-fill)', () => {
  it('calls AI and merges when bank has insufficient questions', async () => {
    // 1 bank question (theory), need 5 → count gap=4; AI fills 4 (all theory) → mix: 5t/0s → scenarioGap=2
    // Type gap-fill for scenario: mockGenerate not set for those calls → non-fatal
    mockFindByConfig.mockResolvedValueOnce([makeQuestion('q1', 'theory')])
    mockFindRecentIds.mockResolvedValueOnce(new Set())
    mockGenerate.mockResolvedValueOnce({
      questions: [makeGenerated('AI Q1'), makeGenerated('AI Q2'), makeGenerated('AI Q3'), makeGenerated('AI Q4')],
      requestedCount: 4,
    })
    mockSaveGenerated.mockResolvedValueOnce(['ai-1', 'ai-2', 'ai-3', 'ai-4'])
    mockFindById
      .mockResolvedValueOnce({ ...makeQuestion('ai-1'), source: 'ai', answer: 'a', explanation: 'e', keyConcepts: [] })
      .mockResolvedValueOnce({ ...makeQuestion('ai-2'), source: 'ai', answer: 'a', explanation: 'e', keyConcepts: [] })
      .mockResolvedValueOnce({ ...makeQuestion('ai-3'), source: 'ai', answer: 'a', explanation: 'e', keyConcepts: [] })
      .mockResolvedValueOnce({ ...makeQuestion('ai-4'), source: 'ai', answer: 'a', explanation: 'e', keyConcepts: [] })

    const result = await questionBankService.getQuestionsForSession(config, 7)

    expect(mockGenerate).toHaveBeenCalledWith({ ...config, count: 4 })
    expect(mockSaveGenerated).toHaveBeenCalledWith(expect.any(Array), 'session')
    expect(result.questions).toHaveLength(5)
    expect(result.gapCount).toBe(0)
  })

  it('degrades gracefully when AI throws (ADR-004)', async () => {
    mockFindByConfig.mockResolvedValueOnce([makeQuestion('q1')])
    mockFindRecentIds.mockResolvedValueOnce(new Set())
    mockGenerate.mockRejectedValue(new Error('OpenAI rate limit'))

    const result = await questionBankService.getQuestionsForSession(config, 7)

    expect(result.questions).toHaveLength(1)
    expect(result.gapCount).toBe(4)
  })

  it('records seen for all questions including AI-generated', async () => {
    mockFindByConfig.mockResolvedValueOnce([makeQuestion('q1')])
    mockFindRecentIds.mockResolvedValueOnce(new Set())
    // Count gap-fill: resolves once with 1 question; type gap-fills: no mock → non-fatal
    mockGenerate.mockResolvedValueOnce({
      questions: [makeGenerated('AI Q1')],
      requestedCount: 4,
    })
    mockSaveGenerated.mockResolvedValueOnce(['ai-1'])
    mockFindById.mockResolvedValueOnce({
      ...makeQuestion('ai-1'), source: 'ai', answer: 'a', explanation: 'e', keyConcepts: [],
    })

    await questionBankService.getQuestionsForSession(config, 7)

    expect(mockRecordSeen).toHaveBeenCalledWith(7, expect.arrayContaining(['q1', 'ai-1']))
  })

  it('returns empty with full gapCount when bank and AI both fail', async () => {
    mockFindByConfig.mockResolvedValueOnce([])
    mockFindRecentIds.mockResolvedValueOnce(new Set())
    mockGenerate.mockRejectedValueOnce(new Error('API unavailable'))

    const result = await questionBankService.getQuestionsForSession(config, 7)

    expect(result.questions).toHaveLength(0)
    expect(result.gapCount).toBe(5)
    expect(mockRecordSeen).not.toHaveBeenCalled()
  })
})
