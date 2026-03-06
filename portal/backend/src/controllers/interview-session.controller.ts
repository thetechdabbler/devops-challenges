import { Request, Response, NextFunction } from 'express'
import { interviewSessionService } from '../services/interview-session.service'
import { Topic, ExperienceLevel } from '@prisma/client'
import { BadRequestError } from '../lib/errors'
import { SessionHistoryCursor } from '../lib/session/types'

const DEFAULT_LIMIT = 20

function encodeCursor(cursor: SessionHistoryCursor): string {
  return Buffer.from(
    JSON.stringify({ createdAt: cursor.createdAt.toISOString(), id: cursor.id }),
    'utf8'
  ).toString('base64url')
}

function decodeCursor(raw: string): SessionHistoryCursor {
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as {
      createdAt?: string
      id?: string
    }
    if (!parsed.createdAt || !parsed.id) {
      throw new Error('missing fields')
    }
    const createdAt = new Date(parsed.createdAt)
    if (Number.isNaN(createdAt.getTime())) {
      throw new Error('invalid date')
    }
    return { createdAt, id: parsed.id }
  } catch {
    throw new BadRequestError('Invalid cursor')
  }
}

export const interviewSessionController = {
  /**
   * POST /api/v1/sessions
   * Creates a new interview session with the given configuration.
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topics, difficulty, experience_level, question_count } = req.body as {
        topics: Topic[]
        difficulty: number
        experience_level: ExperienceLevel
        question_count: number
      }

      const result = await interviewSessionService.createSession(
        {
          topics,
          difficulty,
          experienceLevel: experience_level,
          questionCount: question_count,
        },
        req.user!.id
      )

      res.status(201).json({
        status: 'success',
        data: {
          session_id: result.sessionId,
          status: result.status,
          question_count: result.questionCount,
          ...(result.gapCount > 0 && { gap_count: result.gapCount }),
          current_question: {
            sequence_order: result.currentQuestion.sequenceOrder,
            total_count: result.currentQuestion.totalCount,
            question: result.currentQuestion.question,
          },
        },
      })
    } catch (err) {
      next(err)
    }
  },

  /**
   * POST /api/v1/sessions/:sessionId/questions/:questionId/reveal
   * Reveals the answer to a question. Idempotent. Auto-completes session on last reveal.
   */
  async reveal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, questionId } = req.params
      const result = await interviewSessionService.revealAnswer(sessionId, questionId, req.user!.id)
      res.json({
        status: 'success',
        data: {
          question_id: result.questionId,
          answer: result.answer,
          explanation: result.explanation,
          key_concepts: result.keyConcepts,
          session_status: result.sessionStatus,
        },
      })
    } catch (err) {
      next(err)
    }
  },

  /**
   * GET /api/v1/sessions/:id/questions/current
   * Returns the current (lowest unrevealed) question for a session.
   */
  async getCurrentQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const result = await interviewSessionService.getCurrentQuestion(id, req.user!.id)

      res.json({
        status: 'success',
        data: {
          session_status: result.sessionStatus,
          sequence_order: result.sequenceOrder,
          total_count: result.totalCount,
          question: result.question,
        },
      })
    } catch (err) {
      next(err)
    }
  },

  /**
   * POST /api/v1/sessions/:sessionId/questions/:questionId/rate
   * Stores or updates self-rating for a revealed question.
   */
  async rate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, questionId } = req.params
      const { rating } = req.body as { rating: number }
      const result = await interviewSessionService.submitRating(sessionId, questionId, rating, req.user!.id)

      res.json({
        status: 'success',
        data: {
          session_id: result.sessionId,
          question_id: result.questionId,
          self_rating: result.selfRating,
        },
      })
    } catch (err) {
      next(err)
    }
  },

  /**
   * GET /api/v1/sessions?cursor=&limit=
   * Returns paginated session history for the authenticated user.
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawLimit = req.query.limit as string | undefined
      const limit = rawLimit === undefined ? DEFAULT_LIMIT : Number(rawLimit)
      if (!Number.isFinite(limit)) {
        throw new BadRequestError('limit must be a positive integer')
      }

      const rawCursor = req.query.cursor as string | undefined
      const cursor = rawCursor ? decodeCursor(rawCursor) : undefined

      const result = await interviewSessionService.listSessions(req.user!.id, limit, cursor)

      res.json({
        status: 'success',
        data: {
          items: result.items.map(item => ({
            id: item.id,
            created_at: item.createdAt,
            topics: item.topics,
            difficulty: item.difficulty,
            experience_level: item.experienceLevel,
            question_count: item.questionCount,
            status: item.status,
            avg_self_rating: item.avgSelfRating,
          })),
          nextCursor: result.nextCursor ? encodeCursor(result.nextCursor) : null,
          hasMore: result.hasMore,
        },
      })
    } catch (err) {
      next(err)
    }
  },

  /**
   * GET /api/v1/sessions/:id
   * Returns full session detail for review mode.
   */
  async detail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const result = await interviewSessionService.getSessionDetail(id, req.user!.id)

      res.json({
        status: 'success',
        data: {
          id: result.id,
          created_at: result.createdAt,
          topics: result.topics,
          difficulty: result.difficulty,
          experience_level: result.experienceLevel,
          question_count: result.questionCount,
          status: result.status,
          completed_at: result.completedAt,
          questions: result.questions.map(q => ({
            question_id: q.questionId,
            sequence_order: q.sequenceOrder,
            answer_revealed: q.answerRevealed,
            self_rating: q.selfRating,
            question: {
              id: q.question.id,
              text: q.question.text,
              type: q.question.type,
              topics: q.question.topics,
              answer: q.question.answer,
              explanation: q.question.explanation,
              key_concepts: q.question.keyConcepts,
            },
          })),
        },
      })
    } catch (err) {
      next(err)
    }
  },
}
