import { QuestionStatus, Topic, ExperienceLevel } from '@prisma/client'

jest.mock('../repositories/question.repository')
jest.mock('../lib/question-bank/ai-generator', () => ({
  aiQuestionGenerator: { generate: jest.fn() },
}))

import { adminQuestionService } from '../services/admin-question.service'
import { questionRepository } from '../repositories/question.repository'
import { aiQuestionGenerator } from '../lib/question-bank/ai-generator'
import { GeneratedQuestion, Question } from '../lib/question-bank/types'

const mockGenerate = aiQuestionGenerator.generate as jest.MockedFunction<typeof aiQuestionGenerator.generate>
const mockSaveGenerated = questionRepository.saveGenerated as jest.MockedFunction<typeof questionRepository.saveGenerated>
const mockFindByStatus = questionRepository.findByStatus as jest.MockedFunction<typeof questionRepository.findByStatus>
const mockUpdateReview = questionRepository.updateReview as jest.MockedFunction<typeof questionRepository.updateReview>
const mockGetStats = questionRepository.getStats as jest.MockedFunction<typeof questionRepository.getStats>

function makeGenerated(): GeneratedQuestion {
  return {
    text: 'What is Docker?',
    type: 'theory',
    topics: [Topic.Docker],
    difficulty: 2,
    experienceLevel: ExperienceLevel.junior,
    answer: 'A containerization platform.',
    explanation: 'Docker packages apps into containers.',
    keyConcepts: ['container', 'image'],
  }
}

function makeQuestion(id = 'q-1'): Question {
  return {
    id, text: 'What is Docker?', type: 'theory',
    topics: [Topic.Docker], difficulty: 2,
    experienceLevel: ExperienceLevel.junior,
    source: 'ai', status: QuestionStatus.pending_review,
    createdAt: new Date(),
    answer: 'A containerization platform.',
    explanation: 'Docker packages apps into containers.',
    keyConcepts: ['container'],
  }
}

const config = { topics: [Topic.Docker], difficulty: 2, experienceLevel: ExperienceLevel.junior, count: 5 }

beforeEach(() => jest.clearAllMocks())

describe('adminQuestionService.bulkGenerate', () => {
  it('generates and saves questions as pending_review', async () => {
    mockGenerate.mockResolvedValueOnce({ questions: [makeGenerated(), makeGenerated()], requestedCount: 2 })
    mockSaveGenerated.mockResolvedValueOnce(['id-1', 'id-2'])

    const result = await adminQuestionService.bulkGenerate({ ...config, count: 2 }, 1)

    expect(mockSaveGenerated).toHaveBeenCalledWith(expect.any(Array), 'admin')
    expect(result).toEqual({ requested: 2, saved: 2, errors: 0 })
  })

  it('clamps count to 50', async () => {
    mockGenerate.mockResolvedValueOnce({ questions: [], requestedCount: 50 })
    mockSaveGenerated.mockResolvedValueOnce([])

    const result = await adminQuestionService.bulkGenerate({ ...config, count: 100 }, 1)

    expect(mockGenerate).toHaveBeenCalledWith(expect.objectContaining({ count: 50 }))
    expect(result.requested).toBe(50)
  })

  it('returns errors count on AI failure', async () => {
    mockGenerate.mockRejectedValueOnce(new Error('OpenAI down'))

    const result = await adminQuestionService.bulkGenerate({ ...config, count: 5 }, 1)

    expect(result).toEqual({ requested: 5, saved: 0, errors: 5 })
  })
})

describe('adminQuestionService.reviewQuestion', () => {
  it('approves a question and returns updated question', async () => {
    const approved = { ...makeQuestion(), status: QuestionStatus.active }
    mockUpdateReview.mockResolvedValueOnce(approved)

    const result = await adminQuestionService.reviewQuestion('q-1', 'approve', 1)

    expect(mockUpdateReview).toHaveBeenCalledWith('q-1', QuestionStatus.active, 1, undefined)
    expect(result.status).toBe(QuestionStatus.active)
  })

  it('rejects a question', async () => {
    const rejected = { ...makeQuestion(), status: QuestionStatus.rejected }
    mockUpdateReview.mockResolvedValueOnce(rejected)

    const result = await adminQuestionService.reviewQuestion('q-1', 'reject', 1)

    expect(mockUpdateReview).toHaveBeenCalledWith('q-1', QuestionStatus.rejected, 1, undefined)
    expect(result.status).toBe(QuestionStatus.rejected)
  })

  it('passes updated text on approve with edit', async () => {
    mockUpdateReview.mockResolvedValueOnce({ ...makeQuestion(), text: 'New text', status: QuestionStatus.active })

    await adminQuestionService.reviewQuestion('q-1', 'approve', 1, 'New text')

    expect(mockUpdateReview).toHaveBeenCalledWith('q-1', QuestionStatus.active, 1, 'New text')
  })
})

describe('adminQuestionService.listByStatus', () => {
  it('returns paginated questions', async () => {
    mockFindByStatus.mockResolvedValueOnce({
      questions: [makeQuestion()], nextCursor: null, hasMore: false,
    })

    const result = await adminQuestionService.listByStatus(QuestionStatus.pending_review)

    expect(result.items).toHaveLength(1)
    expect(result.hasMore).toBe(false)
  })
})

describe('adminQuestionService.getStats', () => {
  it('returns bank stats', async () => {
    const stats = {
      byTopic: { Docker: 5 }, byDifficulty: { 2: 5 },
      byType: { theory: 3, scenario: 2 },
      byStatus: { active: 4, pending_review: 1, rejected: 0 },
      pendingReview: 1,
    }
    mockGetStats.mockResolvedValueOnce(stats)

    const result = await adminQuestionService.getStats()

    expect(result.pendingReview).toBe(1)
    expect(result.byTopic).toEqual({ Docker: 5 })
  })
})
