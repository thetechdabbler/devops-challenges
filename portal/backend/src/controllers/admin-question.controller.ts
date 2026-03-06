import { Request, Response, NextFunction } from 'express'
import { QuestionStatus } from '@prisma/client'
import { adminQuestionService } from '../services/admin-question.service'
import { BadRequestError, NotFoundError } from '../lib/errors'
import { Topic, ExperienceLevel, ReviewAction } from '../lib/question-bank/types'

export const adminQuestionController = {
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topics, difficulty, experienceLevel, count } = req.body as {
        topics: Topic[]
        difficulty: number
        experienceLevel: ExperienceLevel
        count: number
      }

      if (!Array.isArray(topics) || topics.length === 0) {
        throw new BadRequestError('topics must be a non-empty array')
      }
      if (typeof difficulty !== 'number' || difficulty < 1 || difficulty > 5) {
        throw new BadRequestError('difficulty must be a number between 1 and 5')
      }
      if (!['junior', 'mid', 'senior'].includes(experienceLevel)) {
        throw new BadRequestError('experienceLevel must be junior, mid, or senior')
      }
      if (typeof count !== 'number' || count < 1) {
        throw new BadRequestError('count must be a positive number')
      }

      const result = await adminQuestionService.bulkGenerate(
        { topics, difficulty, experienceLevel, count },
        req.user!.id
      )

      res.json({ status: 'success', data: result })
    } catch (err) {
      next(err)
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = (req.query.status as QuestionStatus) ?? QuestionStatus.pending_review
      const cursor = req.query.cursor as string | undefined
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20

      if (!Object.values(QuestionStatus).includes(status)) {
        throw new BadRequestError('Invalid status value')
      }

      const result = await adminQuestionService.listByStatus(status, cursor, limit)
      res.json({ status: 'success', data: result })
    } catch (err) {
      next(err)
    }
  },

  async review(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const { action, text } = req.body as { action: ReviewAction; text?: string }

      if (!['approve', 'reject'].includes(action)) {
        throw new BadRequestError('action must be approve or reject')
      }

      const question = await adminQuestionService.reviewQuestion(id, action, req.user!.id, text)
      res.json({ status: 'success', data: question })
    } catch (err) {
      if ((err as { code?: string }).code === 'P2025') {
        next(new NotFoundError(`Question ${req.params.id} not found`))
      } else {
        next(err)
      }
    }
  },

  async stats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminQuestionService.getStats()
      res.json({ status: 'success', data })
    } catch (err) {
      next(err)
    }
  },
}
