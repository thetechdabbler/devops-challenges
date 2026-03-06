import { ExperienceLevel, QuestionStatus, Topic } from '@prisma/client'

jest.mock('../repositories/question.repository')

import { reviewerQuestionService } from '../services/reviewer-question.service'
import { questionRepository } from '../repositories/question.repository'

const mockCreate = questionRepository.createReviewerQuestion as jest.MockedFunction<typeof questionRepository.createReviewerQuestion>
const mockList = questionRepository.findForReviewerList as jest.MockedFunction<typeof questionRepository.findForReviewerList>

beforeEach(() => jest.clearAllMocks())

describe('reviewerQuestionService.createQuestion', () => {
  it('delegates create to repository', async () => {
    const created = {
      id: 'q-1',
      text: 'What is Docker?',
      type: 'theory' as const,
      topics: [Topic.Docker],
      difficulty: 2,
      experienceLevel: ExperienceLevel.junior,
      source: 'bank' as const,
      status: QuestionStatus.active,
      createdAt: new Date('2026-03-06T00:00:00Z'),
      answer: 'A container platform',
      explanation: 'Used to package applications',
      keyConcepts: ['image'],
    }
    mockCreate.mockResolvedValueOnce(created)

    const result = await reviewerQuestionService.createQuestion({
      text: created.text,
      answer: created.answer,
      explanation: created.explanation,
      keyConcepts: created.keyConcepts,
      type: created.type,
      topics: created.topics,
      difficulty: created.difficulty,
      experienceLevel: created.experienceLevel,
      status: created.status,
    }, 1)

    expect(mockCreate).toHaveBeenCalledWith(expect.any(Object), 1)
    expect(result.id).toBe('q-1')
  })
})

describe('reviewerQuestionService.listQuestions', () => {
  it('returns paginated list from repository', async () => {
    const createdAt = new Date('2026-03-06T00:00:00Z')
    mockList.mockResolvedValueOnce({
      questions: [],
      nextCursor: { createdAt, id: 'q-1' },
      hasMore: true,
    })

    const result = await reviewerQuestionService.listQuestions({ status: QuestionStatus.active }, undefined, 20)

    expect(mockList).toHaveBeenCalledWith({ status: QuestionStatus.active }, undefined, 20)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor?.id).toBe('q-1')
  })
})

describe('reviewerQuestionService.updateQuestion', () => {
  it('delegates update to repository', async () => {
    ;(questionRepository.updateReviewerQuestion as jest.Mock).mockResolvedValueOnce({
      kind: 'updated',
      question: {
        id: 'q-1',
        text: 'updated',
        type: 'theory',
        topics: [Topic.Docker],
        difficulty: 2,
        experienceLevel: ExperienceLevel.junior,
        source: 'bank',
        status: QuestionStatus.active,
        createdAt: new Date('2026-03-06T00:00:00Z'),
        answer: 'A',
        explanation: 'E',
        keyConcepts: [],
      },
    })

    const result = await reviewerQuestionService.updateQuestion(
      'q-1',
      1,
      { text: 'updated' },
      1
    )

    expect(questionRepository.updateReviewerQuestion).toHaveBeenCalledWith('q-1', 1, { text: 'updated' }, 1)
    expect(result.kind).toBe('updated')
  })
})
