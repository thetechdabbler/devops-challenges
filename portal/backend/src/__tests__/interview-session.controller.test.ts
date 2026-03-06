jest.mock('../services/interview-session.service', () => ({
  interviewSessionService: {
    createSession: jest.fn(),
    getCurrentQuestion: jest.fn(),
    revealAnswer: jest.fn(),
    submitRating: jest.fn(),
    listSessions: jest.fn(),
    getSessionDetail: jest.fn(),
  },
}))

import { Request, Response, NextFunction } from 'express'
import { interviewSessionController } from '../controllers/interview-session.controller'
import { interviewSessionService } from '../services/interview-session.service'
import { Topic, ExperienceLevel, QuestionType, QuestionSource, QuestionStatus } from '@prisma/client'
import { BadRequestError, ForbiddenError, NotFoundError } from '../lib/errors'
import { QuestionSummary } from '../lib/question-bank/types'

const mockCreate = interviewSessionService.createSession as jest.MockedFunction<typeof interviewSessionService.createSession>
const mockGetCurrent = interviewSessionService.getCurrentQuestion as jest.MockedFunction<typeof interviewSessionService.getCurrentQuestion>
const mockReveal = interviewSessionService.revealAnswer as jest.MockedFunction<typeof interviewSessionService.revealAnswer>
const mockSubmitRating = interviewSessionService.submitRating as jest.MockedFunction<typeof interviewSessionService.submitRating>
const mockListSessions = interviewSessionService.listSessions as jest.MockedFunction<typeof interviewSessionService.listSessions>
const mockGetSessionDetail = interviewSessionService.getSessionDetail as jest.MockedFunction<typeof interviewSessionService.getSessionDetail>

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    user: { id: 1, username: 'testuser', avatarUrl: '', role: 'user' },
    ...overrides,
  } as unknown as Request
}

function makeRes(): { res: Response; json: jest.Mock; status: jest.Mock } {
  const json = jest.fn()
  const status = jest.fn().mockReturnThis()
  const res = { json, status } as unknown as Response
  return { res, json, status }
}

const next = jest.fn() as jest.MockedFunction<NextFunction>

function makeQuestion(): QuestionSummary {
  return {
    id: 'q-1', text: 'What is Docker?', type: QuestionType.theory,
    topics: [Topic.Docker], difficulty: 2,
    experienceLevel: ExperienceLevel.junior,
    source: QuestionSource.bank, status: QuestionStatus.active,
    createdAt: new Date(),
  }
}

beforeEach(() => jest.clearAllMocks())

describe('interviewSessionController.create', () => {
  it('returns 201 with session data on success', async () => {
    mockCreate.mockResolvedValueOnce({
      sessionId: 'sess-1',
      status: 'in_progress',
      questionCount: 5,
      gapCount: 0,
      currentQuestion: { sessionStatus: 'in_progress', sequenceOrder: 1, totalCount: 5, question: makeQuestion() },
    })

    const req = makeReq({
      body: { topics: [Topic.Docker], difficulty: 2, experience_level: ExperienceLevel.junior, question_count: 5 },
    })
    const { res, json, status } = makeRes()

    await interviewSessionController.create(req, res, next)

    expect(status).toHaveBeenCalledWith(201)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({ session_id: 'sess-1', question_count: 5 }),
    }))
  })

  it('includes gap_count in response when gapCount > 0', async () => {
    mockCreate.mockResolvedValueOnce({
      sessionId: 'sess-2',
      status: 'in_progress',
      questionCount: 3,
      gapCount: 2,
      currentQuestion: { sessionStatus: 'in_progress', sequenceOrder: 1, totalCount: 3, question: makeQuestion() },
    })

    const req = makeReq({
      body: { topics: [Topic.Docker], difficulty: 2, experience_level: ExperienceLevel.junior, question_count: 5 },
    })
    const { res, json, status } = makeRes()

    await interviewSessionController.create(req, res, next)

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ gap_count: 2 }),
    }))
  })

  it('does not include gap_count when gapCount is 0', async () => {
    mockCreate.mockResolvedValueOnce({
      sessionId: 'sess-3',
      status: 'in_progress',
      questionCount: 5,
      gapCount: 0,
      currentQuestion: { sessionStatus: 'in_progress', sequenceOrder: 1, totalCount: 5, question: makeQuestion() },
    })

    const req = makeReq({
      body: { topics: [Topic.Docker], difficulty: 2, experience_level: ExperienceLevel.junior, question_count: 5 },
    })
    const { res, json } = makeRes()

    await interviewSessionController.create(req, res, next)

    const responseData = json.mock.calls[0][0].data
    expect(responseData).not.toHaveProperty('gap_count')
  })

  it('calls next(err) when service throws', async () => {
    mockCreate.mockRejectedValueOnce(new BadRequestError('At least one topic is required'))
    const req = makeReq({ body: { topics: [], difficulty: 2, experience_level: 'junior', question_count: 5 } })
    const { res } = makeRes()

    await interviewSessionController.create(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})

describe('interviewSessionController.getCurrentQuestion', () => {
  it('returns current question for in-progress session', async () => {
    mockGetCurrent.mockResolvedValueOnce({
      sessionStatus: 'in_progress',
      sequenceOrder: 3,
      totalCount: 10,
      question: makeQuestion(),
    })

    const req = makeReq({ params: { id: 'sess-1' } })
    const { res, json } = makeRes()

    await interviewSessionController.getCurrentQuestion(req, res, next)

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({ session_status: 'in_progress', sequence_order: 3 }),
    }))
  })

  it('returns completed status with null question', async () => {
    mockGetCurrent.mockResolvedValueOnce({
      sessionStatus: 'completed',
      sequenceOrder: null,
      totalCount: 5,
      question: null,
    })

    const req = makeReq({ params: { id: 'sess-done' } })
    const { res, json } = makeRes()

    await interviewSessionController.getCurrentQuestion(req, res, next)

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ session_status: 'completed', question: null }),
    }))
  })

  it('calls next(NotFoundError) when session not found', async () => {
    mockGetCurrent.mockRejectedValueOnce(new NotFoundError('Session not found'))
    const req = makeReq({ params: { id: 'bad-id' } })
    const { res } = makeRes()

    await interviewSessionController.getCurrentQuestion(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
  })

  it('calls next(ForbiddenError) when session belongs to another user', async () => {
    mockGetCurrent.mockRejectedValueOnce(new ForbiddenError('Access denied'))
    const req = makeReq({ params: { id: 'sess-other' } })
    const { res } = makeRes()

    await interviewSessionController.getCurrentQuestion(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError))
  })
})

describe('interviewSessionController.reveal', () => {
  it('returns answer data with session_status in_progress', async () => {
    mockReveal.mockResolvedValueOnce({
      questionId: 'q-1',
      answer: 'The answer',
      explanation: 'The explanation',
      keyConcepts: ['concept-a'],
      sessionStatus: 'in_progress',
    })
    const req = makeReq({ params: { sessionId: 'sess-1', questionId: 'q-1' } })
    const { res, json } = makeRes()

    await interviewSessionController.reveal(req, res, next)

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({
        question_id: 'q-1',
        answer: 'The answer',
        session_status: 'in_progress',
      }),
    }))
  })

  it('returns session_status completed when last question revealed', async () => {
    mockReveal.mockResolvedValueOnce({
      questionId: 'q-3',
      answer: 'Final answer',
      explanation: 'Explanation',
      keyConcepts: [],
      sessionStatus: 'completed',
    })
    const req = makeReq({ params: { sessionId: 'sess-1', questionId: 'q-3' } })
    const { res, json } = makeRes()

    await interviewSessionController.reveal(req, res, next)

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ session_status: 'completed' }),
    }))
  })

  it('calls next(NotFoundError) when question not in session', async () => {
    mockReveal.mockRejectedValueOnce(new NotFoundError('Question not found in session'))
    const req = makeReq({ params: { sessionId: 'sess-1', questionId: 'bad-q' } })
    const { res } = makeRes()

    await interviewSessionController.reveal(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
  })

  it('calls next(ForbiddenError) when session belongs to another user', async () => {
    mockReveal.mockRejectedValueOnce(new ForbiddenError('Access denied'))
    const req = makeReq({ params: { sessionId: 'sess-other', questionId: 'q-1' } })
    const { res } = makeRes()

    await interviewSessionController.reveal(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError))
  })
})

describe('interviewSessionController.rate', () => {
  it('returns rating payload on success', async () => {
    mockSubmitRating.mockResolvedValueOnce({
      sessionId: 'sess-1',
      questionId: 'q-1',
      selfRating: 4,
    })

    const req = makeReq({
      params: { sessionId: 'sess-1', questionId: 'q-1' },
      body: { rating: 4 },
    })
    const { res, json } = makeRes()

    await interviewSessionController.rate(req, res, next)

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({ self_rating: 4, question_id: 'q-1' }),
    }))
  })

  it('calls next(BadRequestError) for invalid rating', async () => {
    mockSubmitRating.mockRejectedValueOnce(new BadRequestError('Rating must be between 1 and 5'))
    const req = makeReq({ params: { sessionId: 'sess-1', questionId: 'q-1' }, body: { rating: 8 } })
    const { res } = makeRes()
    await interviewSessionController.rate(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})

describe('interviewSessionController.list', () => {
  it('returns paginated sessions', async () => {
    const createdAt = new Date('2026-03-06T00:00:00Z')
    const encodedCursor = Buffer.from(
      JSON.stringify({ createdAt: createdAt.toISOString(), id: 'sess-1' }),
      'utf8'
    ).toString('base64url')

    mockListSessions.mockResolvedValueOnce({
      items: [{
        id: 'sess-1',
        createdAt,
        topics: [Topic.Docker],
        difficulty: 2,
        experienceLevel: ExperienceLevel.junior,
        questionCount: 5,
        status: 'completed',
        avgSelfRating: 4.5,
      }],
      nextCursor: { createdAt, id: 'sess-1' },
      hasMore: true,
    })

    const req = makeReq({ query: { limit: '10', cursor: encodedCursor } })
    const { res, json } = makeRes()
    await interviewSessionController.list(req, res, next)

    expect(mockListSessions).toHaveBeenCalledWith(1, 10, { createdAt, id: 'sess-1' })
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({ hasMore: true }),
    }))
  })

  it('calls next(BadRequestError) for invalid cursor', async () => {
    const req = makeReq({ query: { cursor: 'not-base64' } })
    const { res } = makeRes()
    await interviewSessionController.list(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})

describe('interviewSessionController.detail', () => {
  it('returns full session detail', async () => {
    mockGetSessionDetail.mockResolvedValueOnce({
      id: 'sess-1',
      createdAt: new Date('2026-03-06T00:00:00Z'),
      topics: [Topic.Docker],
      difficulty: 2,
      experienceLevel: ExperienceLevel.junior,
      questionCount: 3,
      status: 'completed',
      completedAt: new Date('2026-03-06T00:30:00Z'),
      questions: [{
        questionId: 'q-1',
        sequenceOrder: 1,
        answerRevealed: false,
        selfRating: null,
        question: {
          id: 'q-1',
          text: 'What is Docker?',
          type: 'theory',
          topics: [Topic.Docker],
          answer: 'A',
          explanation: 'E',
          keyConcepts: ['c1'],
        },
      }],
    })

    const req = makeReq({ params: { id: 'sess-1' } })
    const { res, json } = makeRes()
    await interviewSessionController.detail(req, res, next)

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({
        id: 'sess-1',
        questions: expect.any(Array),
      }),
    }))
  })

  it('calls next(NotFoundError) when session missing', async () => {
    mockGetSessionDetail.mockRejectedValueOnce(new NotFoundError('Session not found'))
    const req = makeReq({ params: { id: 'missing' } })
    const { res } = makeRes()
    await interviewSessionController.detail(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
  })
})
