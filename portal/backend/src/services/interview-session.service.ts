import { interviewSessionRepository } from '../repositories/interview-session.repository'
import { questionRepository } from '../repositories/question.repository'
import { questionBankService } from './question-bank.service'
import { log } from '../lib/logger'
import { BadRequestError, ForbiddenError, InternalError, NotFoundError } from '../lib/errors'
import { Topic, ExperienceLevel } from '@prisma/client'
import {
  CreateSessionResult,
  CurrentQuestionResult,
  InterviewSessionConfig,
  RevealResult,
  SessionDetailResult,
  SessionHistoryCursor,
  SessionHistoryResult,
  SubmitRatingResult,
} from '../lib/session/types'

const VALID_TOPICS = new Set<string>(Object.values(Topic))
const VALID_LEVELS = new Set<string>(['junior', 'mid', 'senior'])

export const interviewSessionService = {
  /**
   * Validates config, fetches questions from the bank (hybrid flow), and
   * atomically creates an InterviewSession + InterviewSessionQuestions.
   *
   * Per ADR-007: if gapCount > 0, session is created with actual question count.
   * If zero questions are available, throws 503 (degenerate case).
   */
  async createSession(config: InterviewSessionConfig, userId: number): Promise<CreateSessionResult> {
    // Validate config
    if (!Array.isArray(config.topics) || config.topics.length === 0) {
      throw new BadRequestError('At least one topic is required')
    }
    for (const t of config.topics) {
      if (!VALID_TOPICS.has(t)) {
        throw new BadRequestError(`Invalid topic: ${t}`)
      }
    }
    if (typeof config.difficulty !== 'number' || config.difficulty < 1 || config.difficulty > 5) {
      throw new BadRequestError('difficulty must be between 1 and 5')
    }
    if (!VALID_LEVELS.has(config.experienceLevel)) {
      throw new BadRequestError('experienceLevel must be junior, mid, or senior')
    }
    if (typeof config.questionCount !== 'number' || config.questionCount < 5 || config.questionCount > 20) {
      throw new BadRequestError('question_count must be between 5 and 20')
    }

    // Fetch questions from the bank (hybrid flow — ADR-004)
    const { questions, gapCount } = await questionBankService.getQuestionsForSession(
      {
        topics: config.topics,
        difficulty: config.difficulty,
        experienceLevel: config.experienceLevel,
        count: config.questionCount,
      },
      userId
    )

    // Degenerate case — no questions at all (ADR-007)
    if (questions.length === 0) {
      log.warn({ config }, 'Session creation failed: no questions available from bank or AI')
      throw new InternalError('No questions available for the requested configuration. Try different topics or difficulty.')
    }

    if (gapCount > 0) {
      log.warn({ requested: config.questionCount, actual: questions.length, gapCount }, 'Session created with fewer questions than requested (ADR-007)')
    }

    // Atomically persist session + questions
    const { id, questionCount } = await interviewSessionRepository.create(
      userId,
      {
        topics: config.topics,
        difficulty: config.difficulty,
        experienceLevel: config.experienceLevel as ExperienceLevel,
      },
      questions.map(q => q.id)
    )

    // Build current question (first in sequence)
    const currentQuestion: CurrentQuestionResult = {
      sessionStatus: 'in_progress',
      sequenceOrder: 1,
      totalCount: questionCount,
      question: questions[0],
    }

    return {
      sessionId: id,
      status: 'in_progress',
      questionCount,
      gapCount,
      currentQuestion,
    }
  },

  /**
   * Reveals the answer to a question in a session (ADR-002 boundary — full Question returned).
   * Idempotent — second reveal returns same answer without error (ADR-009).
   * If this is the last unrevealed question, session auto-completes (ADR-009).
   */
  async revealAnswer(sessionId: string, questionId: string, userId: number): Promise<RevealResult> {
    const session = await interviewSessionRepository.findById(sessionId)
    if (!session) throw new NotFoundError(`Session ${sessionId} not found`)
    if (session.userId !== userId) throw new ForbiddenError('Access denied')

    const revealResult = await interviewSessionRepository.revealQuestion(sessionId, questionId)
    if (!revealResult) throw new NotFoundError(`Question ${questionId} not found in session ${sessionId}`)

    const question = await questionRepository.findById(questionId)
    if (!question) throw new NotFoundError(`Question ${questionId} not found`)

    // Auto-complete session if all questions are now revealed (ADR-009)
    const unrevealed = await interviewSessionRepository.countUnrevealed(sessionId)
    let sessionStatus: 'in_progress' | 'completed' = 'in_progress'
    if (unrevealed === 0) {
      await interviewSessionRepository.completeSession(sessionId)
      sessionStatus = 'completed'
      log.info({ sessionId, userId }, 'Session auto-completed on last reveal (ADR-009)')
    }

    return {
      questionId,
      answer: question.answer,
      explanation: question.explanation,
      keyConcepts: question.keyConcepts,
      sessionStatus,
    }
  },

  /**
   * Returns the current question for a session, enforcing ownership.
   * 404 if session not found, 403 if session belongs to another user.
   */
  async getCurrentQuestion(sessionId: string, userId: number): Promise<CurrentQuestionResult> {
    const session = await interviewSessionRepository.findById(sessionId)
    if (!session) throw new NotFoundError(`Session ${sessionId} not found`)
    if (session.userId !== userId) throw new ForbiddenError('Access denied')

    const result = await interviewSessionRepository.findCurrentQuestion(sessionId)
    if (!result) throw new NotFoundError(`Session ${sessionId} not found`)

    return result
  },

  /**
   * Submits or updates self-rating for a revealed session question.
   * Rating is last-write-wins.
   */
  async submitRating(
    sessionId: string,
    questionId: string,
    rating: number,
    userId: number
  ): Promise<SubmitRatingResult> {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestError('Rating must be between 1 and 5')
    }

    const session = await interviewSessionRepository.findById(sessionId)
    if (!session) throw new NotFoundError(`Session ${sessionId} not found`)
    if (session.userId !== userId) throw new ForbiddenError('Access denied')

    const sessionQuestion = await interviewSessionRepository.findSessionQuestion(sessionId, questionId)
    if (!sessionQuestion) {
      throw new NotFoundError(`Question ${questionId} not found in session ${sessionId}`)
    }
    if (!sessionQuestion.answerRevealed) {
      throw new BadRequestError('Answer must be revealed before rating')
    }

    const updated = await interviewSessionRepository.updateSelfRating(sessionId, questionId, rating)
    return {
      sessionId,
      questionId: updated.questionId,
      selfRating: updated.selfRating,
    }
  },

  /**
   * Lists user sessions in reverse chronological order using keyset pagination.
   */
  async listSessions(
    userId: number,
    limit: number,
    cursor?: SessionHistoryCursor
  ): Promise<SessionHistoryResult> {
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new BadRequestError('limit must be a positive integer')
    }
    const boundedLimit = Math.min(limit, 100)
    return interviewSessionRepository.listByUser(userId, boundedLimit, cursor)
  },

  /**
   * Returns full session detail for review mode.
   */
  async getSessionDetail(sessionId: string, userId: number): Promise<SessionDetailResult> {
    const session = await interviewSessionRepository.findById(sessionId)
    if (!session) throw new NotFoundError(`Session ${sessionId} not found`)
    if (session.userId !== userId) throw new ForbiddenError('Access denied')

    const detail = await interviewSessionRepository.getSessionDetail(sessionId)
    if (!detail) throw new NotFoundError(`Session ${sessionId} not found`)
    return detail
  },
}
