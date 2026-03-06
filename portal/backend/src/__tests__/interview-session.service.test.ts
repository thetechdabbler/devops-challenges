jest.mock('../repositories/interview-session.repository', () => ({
  interviewSessionRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findCurrentQuestion: jest.fn(),
    revealQuestion: jest.fn(),
    countUnrevealed: jest.fn(),
    completeSession: jest.fn(),
    findSessionQuestion: jest.fn(),
    updateSelfRating: jest.fn(),
    listByUser: jest.fn(),
    getSessionDetail: jest.fn(),
  },
}))

jest.mock('../repositories/question.repository', () => ({
  questionRepository: {
    findById: jest.fn(),
  },
}))

jest.mock('../services/question-bank.service', () => ({
  questionBankService: {
    getQuestionsForSession: jest.fn(),
  },
}))

jest.mock('../lib/logger', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), fatal: jest.fn() },
}))

import { interviewSessionService } from '../services/interview-session.service'
import { interviewSessionRepository } from '../repositories/interview-session.repository'
import { questionRepository } from '../repositories/question.repository'
import { questionBankService } from '../services/question-bank.service'
import { BadRequestError, ForbiddenError, InternalError, NotFoundError } from '../lib/errors'
import { Topic, ExperienceLevel, InterviewSessionStatus, QuestionType, QuestionSource, QuestionStatus } from '@prisma/client'
import { Question, QuestionSummary } from '../lib/question-bank/types'

const mockCreate = interviewSessionRepository.create as jest.MockedFunction<typeof interviewSessionRepository.create>
const mockFindById = interviewSessionRepository.findById as jest.MockedFunction<typeof interviewSessionRepository.findById>
const mockFindCurrentQuestion = interviewSessionRepository.findCurrentQuestion as jest.MockedFunction<typeof interviewSessionRepository.findCurrentQuestion>
const mockRevealQuestion = interviewSessionRepository.revealQuestion as jest.MockedFunction<typeof interviewSessionRepository.revealQuestion>
const mockCountUnrevealed = interviewSessionRepository.countUnrevealed as jest.MockedFunction<typeof interviewSessionRepository.countUnrevealed>
const mockCompleteSession = interviewSessionRepository.completeSession as jest.MockedFunction<typeof interviewSessionRepository.completeSession>
const mockFindSessionQuestion = interviewSessionRepository.findSessionQuestion as jest.MockedFunction<typeof interviewSessionRepository.findSessionQuestion>
const mockUpdateSelfRating = interviewSessionRepository.updateSelfRating as jest.MockedFunction<typeof interviewSessionRepository.updateSelfRating>
const mockListByUser = interviewSessionRepository.listByUser as jest.MockedFunction<typeof interviewSessionRepository.listByUser>
const mockGetSessionDetail = interviewSessionRepository.getSessionDetail as jest.MockedFunction<typeof interviewSessionRepository.getSessionDetail>
const mockQuestionFindById = questionRepository.findById as jest.MockedFunction<typeof questionRepository.findById>
const mockGetQuestions = questionBankService.getQuestionsForSession as jest.MockedFunction<typeof questionBankService.getQuestionsForSession>

function makeQuestion(id = 'q-1'): QuestionSummary {
  return {
    id,
    text: `Question ${id}`,
    type: QuestionType.theory,
    topics: [Topic.Docker],
    difficulty: 2,
    experienceLevel: ExperienceLevel.junior,
    source: QuestionSource.bank,
    status: QuestionStatus.active,
    createdAt: new Date(),
  }
}

function makeFullQuestion(id = 'q-1'): Question {
  return {
    ...makeQuestion(id),
    answer: 'The answer',
    explanation: 'The explanation',
    keyConcepts: ['concept-a'],
  }
}

const validConfig = {
  topics: [Topic.Docker],
  difficulty: 2,
  experienceLevel: ExperienceLevel.junior,
  questionCount: 5,
}

beforeEach(() => jest.clearAllMocks())

// ─── createSession ────────────────────────────────────────────────────────────

describe('interviewSessionService.createSession', () => {
  it('creates session and returns first question when bank has enough questions', async () => {
    const questions = [makeQuestion('q-1'), makeQuestion('q-2'), makeQuestion('q-3'), makeQuestion('q-4'), makeQuestion('q-5')]
    mockGetQuestions.mockResolvedValueOnce({ questions, gapCount: 0 })
    mockCreate.mockResolvedValueOnce({ id: 'sess-1', questionCount: 5 })

    const result = await interviewSessionService.createSession(validConfig, 1)

    expect(result.sessionId).toBe('sess-1')
    expect(result.questionCount).toBe(5)
    expect(result.gapCount).toBe(0)
    expect(result.currentQuestion.question?.id).toBe('q-1')
    expect(result.currentQuestion.sequenceOrder).toBe(1)
  })

  it('creates session with actual count when gapCount > 0 (ADR-007)', async () => {
    const questions = [makeQuestion('q-1'), makeQuestion('q-2'), makeQuestion('q-3')]
    mockGetQuestions.mockResolvedValueOnce({ questions, gapCount: 2 })
    mockCreate.mockResolvedValueOnce({ id: 'sess-2', questionCount: 3 })

    const result = await interviewSessionService.createSession(validConfig, 1)

    expect(result.questionCount).toBe(3)
    expect(result.gapCount).toBe(2)
    expect(mockCreate).toHaveBeenCalledWith(1, expect.any(Object), ['q-1', 'q-2', 'q-3'])
  })

  it('throws InternalError when zero questions returned (ADR-007 degenerate case)', async () => {
    mockGetQuestions.mockResolvedValueOnce({ questions: [], gapCount: 5 })

    await expect(interviewSessionService.createSession(validConfig, 1)).rejects.toThrow(InternalError)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('throws BadRequestError when topics is empty', async () => {
    await expect(
      interviewSessionService.createSession({ ...validConfig, topics: [] }, 1)
    ).rejects.toThrow(BadRequestError)
  })

  it('throws BadRequestError when difficulty is out of range', async () => {
    await expect(
      interviewSessionService.createSession({ ...validConfig, difficulty: 6 }, 1)
    ).rejects.toThrow(BadRequestError)
  })

  it('throws BadRequestError when question_count < 5', async () => {
    await expect(
      interviewSessionService.createSession({ ...validConfig, questionCount: 4 }, 1)
    ).rejects.toThrow(BadRequestError)
  })

  it('throws BadRequestError when question_count > 20', async () => {
    await expect(
      interviewSessionService.createSession({ ...validConfig, questionCount: 21 }, 1)
    ).rejects.toThrow(BadRequestError)
  })

  it('throws BadRequestError for invalid topic value', async () => {
    await expect(
      interviewSessionService.createSession({ ...validConfig, topics: ['InvalidTopic' as Topic] }, 1)
    ).rejects.toThrow(BadRequestError)
  })
})

// ─── getCurrentQuestion ───────────────────────────────────────────────────────

describe('interviewSessionService.getCurrentQuestion', () => {
  it('returns current question for owner', async () => {
    mockFindById.mockResolvedValueOnce({ id: 'sess-1', userId: 1, questionCount: 5, status: InterviewSessionStatus.in_progress })
    mockFindCurrentQuestion.mockResolvedValueOnce({
      sessionStatus: 'in_progress',
      sequenceOrder: 2,
      totalCount: 5,
      question: makeQuestion('q-2'),
    })

    const result = await interviewSessionService.getCurrentQuestion('sess-1', 1)

    expect(result.sessionStatus).toBe('in_progress')
    expect(result.sequenceOrder).toBe(2)
    expect(result.question?.id).toBe('q-2')
  })

  it('throws NotFoundError when session does not exist', async () => {
    mockFindById.mockResolvedValueOnce(null)
    await expect(interviewSessionService.getCurrentQuestion('bad-id', 1)).rejects.toThrow(NotFoundError)
  })

  it('throws ForbiddenError when session belongs to another user', async () => {
    mockFindById.mockResolvedValueOnce({ id: 'sess-1', userId: 2, questionCount: 5, status: InterviewSessionStatus.in_progress })
    await expect(interviewSessionService.getCurrentQuestion('sess-1', 1)).rejects.toThrow(ForbiddenError)
  })

  it('returns completed status when all questions are revealed', async () => {
    mockFindById.mockResolvedValueOnce({ id: 'sess-1', userId: 1, questionCount: 5, status: InterviewSessionStatus.in_progress })
    mockFindCurrentQuestion.mockResolvedValueOnce({
      sessionStatus: 'completed',
      sequenceOrder: null,
      totalCount: 5,
      question: null,
    })

    const result = await interviewSessionService.getCurrentQuestion('sess-1', 1)
    expect(result.sessionStatus).toBe('completed')
    expect(result.question).toBeNull()
  })
})

// ─── revealAnswer ─────────────────────────────────────────────────────────────

describe('interviewSessionService.revealAnswer', () => {
  const session = { id: 'sess-1', userId: 1, questionCount: 3, status: InterviewSessionStatus.in_progress }

  it('reveals answer and returns full question data', async () => {
    mockFindById.mockResolvedValueOnce(session)
    mockRevealQuestion.mockResolvedValueOnce({ questionId: 'q-1', alreadyRevealed: false })
    mockQuestionFindById.mockResolvedValueOnce(makeFullQuestion('q-1'))
    mockCountUnrevealed.mockResolvedValueOnce(2)

    const result = await interviewSessionService.revealAnswer('sess-1', 'q-1', 1)

    expect(result.answer).toBe('The answer')
    expect(result.explanation).toBe('The explanation')
    expect(result.keyConcepts).toEqual(['concept-a'])
    expect(result.sessionStatus).toBe('in_progress')
    expect(mockCompleteSession).not.toHaveBeenCalled()
  })

  it('is idempotent — second reveal returns same answer without error', async () => {
    mockFindById.mockResolvedValueOnce(session)
    mockRevealQuestion.mockResolvedValueOnce({ questionId: 'q-1', alreadyRevealed: true })
    mockQuestionFindById.mockResolvedValueOnce(makeFullQuestion('q-1'))
    mockCountUnrevealed.mockResolvedValueOnce(1)

    const result = await interviewSessionService.revealAnswer('sess-1', 'q-1', 1)
    expect(result.answer).toBe('The answer')
    expect(result.sessionStatus).toBe('in_progress')
  })

  it('auto-completes session when last question is revealed (ADR-009)', async () => {
    mockFindById.mockResolvedValueOnce(session)
    mockRevealQuestion.mockResolvedValueOnce({ questionId: 'q-3', alreadyRevealed: false })
    mockQuestionFindById.mockResolvedValueOnce(makeFullQuestion('q-3'))
    mockCountUnrevealed.mockResolvedValueOnce(0)
    mockCompleteSession.mockResolvedValueOnce(undefined)

    const result = await interviewSessionService.revealAnswer('sess-1', 'q-3', 1)

    expect(mockCompleteSession).toHaveBeenCalledWith('sess-1')
    expect(result.sessionStatus).toBe('completed')
  })

  it('throws NotFoundError when session does not exist', async () => {
    mockFindById.mockResolvedValueOnce(null)
    await expect(interviewSessionService.revealAnswer('bad', 'q-1', 1)).rejects.toThrow(NotFoundError)
  })

  it('throws ForbiddenError when session belongs to another user', async () => {
    mockFindById.mockResolvedValueOnce({ ...session, userId: 2 })
    await expect(interviewSessionService.revealAnswer('sess-1', 'q-1', 1)).rejects.toThrow(ForbiddenError)
  })

  it('throws NotFoundError when question is not in session', async () => {
    mockFindById.mockResolvedValueOnce(session)
    mockRevealQuestion.mockResolvedValueOnce(null)
    await expect(interviewSessionService.revealAnswer('sess-1', 'q-bad', 1)).rejects.toThrow(NotFoundError)
  })
})

// ─── submitRating ─────────────────────────────────────────────────────────────

describe('interviewSessionService.submitRating', () => {
  const session = { id: 'sess-1', userId: 1, questionCount: 3, status: InterviewSessionStatus.in_progress }

  it('stores rating when answer has been revealed', async () => {
    mockFindById.mockResolvedValueOnce(session)
    mockFindSessionQuestion.mockResolvedValueOnce({ answerRevealed: true, selfRating: null })
    mockUpdateSelfRating.mockResolvedValueOnce({ questionId: 'q-1', selfRating: 4 })

    const result = await interviewSessionService.submitRating('sess-1', 'q-1', 4, 1)

    expect(result).toEqual({ sessionId: 'sess-1', questionId: 'q-1', selfRating: 4 })
    expect(mockUpdateSelfRating).toHaveBeenCalledWith('sess-1', 'q-1', 4)
  })

  it('supports last-write-wins by allowing re-rating', async () => {
    mockFindById.mockResolvedValueOnce(session)
    mockFindSessionQuestion.mockResolvedValueOnce({ answerRevealed: true, selfRating: 2 })
    mockUpdateSelfRating.mockResolvedValueOnce({ questionId: 'q-1', selfRating: 5 })

    const result = await interviewSessionService.submitRating('sess-1', 'q-1', 5, 1)
    expect(result.selfRating).toBe(5)
  })

  it('throws BadRequestError when rating out of bounds', async () => {
    await expect(interviewSessionService.submitRating('sess-1', 'q-1', 6, 1)).rejects.toThrow(BadRequestError)
  })

  it('throws BadRequestError when answer is not revealed', async () => {
    mockFindById.mockResolvedValueOnce(session)
    mockFindSessionQuestion.mockResolvedValueOnce({ answerRevealed: false, selfRating: null })

    await expect(interviewSessionService.submitRating('sess-1', 'q-1', 3, 1)).rejects.toThrow(BadRequestError)
  })

  it('throws NotFoundError when question is not in session', async () => {
    mockFindById.mockResolvedValueOnce(session)
    mockFindSessionQuestion.mockResolvedValueOnce(null)

    await expect(interviewSessionService.submitRating('sess-1', 'q-missing', 3, 1)).rejects.toThrow(NotFoundError)
  })

  it('throws ForbiddenError for another users session', async () => {
    mockFindById.mockResolvedValueOnce({ ...session, userId: 2 })
    await expect(interviewSessionService.submitRating('sess-1', 'q-1', 3, 1)).rejects.toThrow(ForbiddenError)
  })
})

// ─── listSessions ─────────────────────────────────────────────────────────────

describe('interviewSessionService.listSessions', () => {
  it('returns paginated session history for user', async () => {
    const createdAt = new Date('2026-03-06T00:00:00Z')
    mockListByUser.mockResolvedValueOnce({
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

    const result = await interviewSessionService.listSessions(1, 20)

    expect(result.items).toHaveLength(1)
    expect(result.hasMore).toBe(true)
    expect(mockListByUser).toHaveBeenCalledWith(1, 20, undefined)
  })

  it('clamps limit above 100', async () => {
    mockListByUser.mockResolvedValueOnce({ items: [], nextCursor: null, hasMore: false })
    await interviewSessionService.listSessions(1, 500)
    expect(mockListByUser).toHaveBeenCalledWith(1, 100, undefined)
  })

  it('throws BadRequestError when limit is invalid', async () => {
    await expect(interviewSessionService.listSessions(1, 0)).rejects.toThrow(BadRequestError)
  })
})

// ─── getSessionDetail ─────────────────────────────────────────────────────────

describe('interviewSessionService.getSessionDetail', () => {
  const session = { id: 'sess-1', userId: 1, questionCount: 3, status: InterviewSessionStatus.completed }

  it('returns full detail for session owner', async () => {
    mockFindById.mockResolvedValueOnce(session)
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
          text: 'Question q-1',
          type: 'theory',
          topics: [Topic.Docker],
          answer: 'A',
          explanation: 'E',
          keyConcepts: ['c1'],
        },
      }],
    })

    const result = await interviewSessionService.getSessionDetail('sess-1', 1)
    expect(result.questions[0].question.answer).toBe('A')
  })

  it('throws ForbiddenError when session belongs to another user', async () => {
    mockFindById.mockResolvedValueOnce({ ...session, userId: 2 })
    await expect(interviewSessionService.getSessionDetail('sess-1', 1)).rejects.toThrow(ForbiddenError)
  })

  it('throws NotFoundError when session missing', async () => {
    mockFindById.mockResolvedValueOnce(null)
    await expect(interviewSessionService.getSessionDetail('missing', 1)).rejects.toThrow(NotFoundError)
  })
})
