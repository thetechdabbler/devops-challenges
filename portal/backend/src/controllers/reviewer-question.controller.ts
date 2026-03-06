import { ExperienceLevel, QuestionStatus, QuestionType, Topic } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { BadRequestError, NotFoundError } from '../lib/errors'
import { ReviewerQuestionCursor } from '../lib/reviewer-question/types'
import { reviewerQuestionService } from '../services/reviewer-question.service'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function encodeCursor(cursor: ReviewerQuestionCursor): string {
  return Buffer.from(
    JSON.stringify({ createdAt: cursor.createdAt.toISOString(), id: cursor.id }),
    'utf8'
  ).toString('base64url')
}

function decodeCursor(raw: string): ReviewerQuestionCursor {
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

function parseTopics(raw: unknown): Topic[] | undefined {
  if (typeof raw !== 'string' || raw.trim() === '') return undefined
  const values = raw
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)

  if (values.length === 0) return undefined
  const allowed = new Set(Object.values(Topic))
  for (const value of values) {
    if (!allowed.has(value as Topic)) {
      throw new BadRequestError(`Invalid topic: ${value}`)
    }
  }

  return values as Topic[]
}

function parseOptionalEnum<T extends string>(
  raw: unknown,
  allowed: readonly T[],
  label: string
): T | undefined {
  if (raw === undefined) return undefined
  if (typeof raw !== 'string') {
    throw new BadRequestError(`${label} must be a string`)
  }
  if (!allowed.includes(raw as T)) {
    throw new BadRequestError(`Invalid ${label} value`)
  }
  return raw as T
}

function parseOptionalDifficulty(raw: unknown): number | undefined {
  if (raw === undefined) return undefined
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new BadRequestError('difficulty must be an integer between 1 and 5')
  }
  return value
}

function parseLimit(raw: unknown): number {
  if (raw === undefined) return DEFAULT_LIMIT
  const value = Number(raw)
  if (!Number.isInteger(value) || value <= 0 || value > MAX_LIMIT) {
    throw new BadRequestError(`limit must be a positive integer <= ${MAX_LIMIT}`)
  }
  return value
}

export const reviewerQuestionController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as Record<string, unknown>
      const text = typeof body.text === 'string' ? body.text.trim() : ''
      const answer = typeof body.answer === 'string' ? body.answer.trim() : ''
      const explanation = typeof body.explanation === 'string' ? body.explanation.trim() : ''

      if (!text) throw new BadRequestError('text is required')
      if (!answer) throw new BadRequestError('answer is required')
      if (!explanation) throw new BadRequestError('explanation is required')

      const type = parseOptionalEnum(body.type, Object.values(QuestionType), 'type')
      const experienceLevel = parseOptionalEnum(
        body.experience_level,
        Object.values(ExperienceLevel),
        'experience_level'
      )
      const status = parseOptionalEnum(body.status, Object.values(QuestionStatus), 'status')
      const difficulty = parseOptionalDifficulty(body.difficulty)

      if (!type) throw new BadRequestError('type is required')
      if (!experienceLevel) throw new BadRequestError('experience_level is required')
      if (!status) throw new BadRequestError('status is required')
      if (difficulty === undefined) throw new BadRequestError('difficulty is required')

      if (!Array.isArray(body.topics) || body.topics.length === 0) {
        throw new BadRequestError('topics must be a non-empty array')
      }
      const topics = body.topics.map(v => String(v))
      const allowedTopics = new Set(Object.values(Topic))
      for (const topic of topics) {
        if (!allowedTopics.has(topic as Topic)) {
          throw new BadRequestError(`Invalid topic: ${topic}`)
        }
      }

      const keyConceptsRaw = body.key_concepts
      const keyConcepts = Array.isArray(keyConceptsRaw)
        ? keyConceptsRaw.map(v => String(v).trim()).filter(Boolean)
        : []

      const created = await reviewerQuestionService.createQuestion({
        text,
        answer,
        explanation,
        keyConcepts,
        type,
        topics: [...new Set(topics)] as Topic[],
        difficulty,
        experienceLevel,
        status,
      }, req.user!.id)

      res.status(201).json({ status: 'success', data: created })
    } catch (err) {
      next(err)
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topics = parseTopics(req.query.topics)
      const type = parseOptionalEnum(req.query.type, Object.values(QuestionType), 'type')
      const difficulty = parseOptionalDifficulty(req.query.difficulty)
      const experienceLevel = parseOptionalEnum(
        req.query.experience_level,
        Object.values(ExperienceLevel),
        'experience_level'
      )
      const status = parseOptionalEnum(req.query.status, Object.values(QuestionStatus), 'status')
      const limit = parseLimit(req.query.limit)
      const cursor =
        typeof req.query.cursor === 'string' && req.query.cursor
          ? decodeCursor(req.query.cursor)
          : undefined

      const result = await reviewerQuestionService.listQuestions(
        { topics, type, difficulty, experienceLevel, status },
        cursor,
        limit
      )

      res.json({
        status: 'success',
        data: {
          items: result.items,
          nextCursor: result.nextCursor ? encodeCursor(result.nextCursor) : null,
          hasMore: result.hasMore,
        },
      })
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const body = req.body as Record<string, unknown>
      const revisionToken = Number(body.revision_token)
      if (!Number.isInteger(revisionToken) || revisionToken < 0) {
        throw new BadRequestError('revision_token must be a non-negative integer')
      }

      const patch: {
        text?: string
        answer?: string
        explanation?: string
        keyConcepts?: string[]
        type?: QuestionType
        topics?: Topic[]
        difficulty?: number
        experienceLevel?: ExperienceLevel
        status?: QuestionStatus
      } = {}

      if (body.text !== undefined) {
        const text = String(body.text).trim()
        if (!text) throw new BadRequestError('text cannot be empty')
        patch.text = text
      }
      if (body.answer !== undefined) {
        const answer = String(body.answer).trim()
        if (!answer) throw new BadRequestError('answer cannot be empty')
        patch.answer = answer
      }
      if (body.explanation !== undefined) {
        const explanation = String(body.explanation).trim()
        if (!explanation) throw new BadRequestError('explanation cannot be empty')
        patch.explanation = explanation
      }
      if (body.key_concepts !== undefined) {
        if (!Array.isArray(body.key_concepts)) {
          throw new BadRequestError('key_concepts must be an array')
        }
        patch.keyConcepts = body.key_concepts.map(v => String(v).trim()).filter(Boolean)
      }
      if (body.type !== undefined) {
        patch.type = parseOptionalEnum(body.type, Object.values(QuestionType), 'type')
      }
      if (body.difficulty !== undefined) {
        patch.difficulty = parseOptionalDifficulty(body.difficulty)
      }
      if (body.experience_level !== undefined) {
        patch.experienceLevel = parseOptionalEnum(
          body.experience_level,
          Object.values(ExperienceLevel),
          'experience_level'
        )
      }
      if (body.status !== undefined) {
        patch.status = parseOptionalEnum(body.status, Object.values(QuestionStatus), 'status')
      }
      if (body.topics !== undefined) {
        if (!Array.isArray(body.topics) || body.topics.length === 0) {
          throw new BadRequestError('topics must be a non-empty array')
        }
        const values = body.topics.map(v => String(v))
        const allowedTopics = new Set(Object.values(Topic))
        for (const topic of values) {
          if (!allowedTopics.has(topic as Topic)) {
            throw new BadRequestError(`Invalid topic: ${topic}`)
          }
        }
        patch.topics = [...new Set(values)] as Topic[]
      }

      if (Object.keys(patch).length === 0) {
        throw new BadRequestError('At least one field must be provided for update')
      }

      const result = await reviewerQuestionService.updateQuestion(id, revisionToken, patch, req.user!.id)
      if (result.kind === 'not_found') {
        throw new NotFoundError(`Question ${id} not found`)
      }
      if (result.kind === 'conflict') {
        res.status(409).json({
          error: { code: 'CONFLICT', message: 'Stale update - refresh and retry' },
          data: {
            latest: result.latest,
            expected_version: result.conflict.expectedVersion,
            actual_version: result.conflict.actualVersion,
          },
        })
        return
      }

      res.json({ status: 'success', data: result.question })
    } catch (err) {
      next(err)
    }
  },

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const result = await reviewerQuestionService.archiveQuestion(id, req.user!.id)
      if (result.kind === 'not_found') {
        throw new NotFoundError(`Question ${id} not found`)
      }

      res.json({
        status: 'success',
        data: { question: result.question, idempotent: result.idempotent },
      })
    } catch (err) {
      next(err)
    }
  },

  async audit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const limit = req.query.limit ? parseLimit(req.query.limit) : 50
      const events = await reviewerQuestionService.listAuditEvents(id, limit)
      res.json({ status: 'success', data: { items: events } })
    } catch (err) {
      next(err)
    }
  },
}
