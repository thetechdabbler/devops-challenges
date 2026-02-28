import { NextFunction, Request, Response } from 'express'
import { ProgressStatus } from '@prisma/client'
import { progressService } from '../services/progress.service'
import { sessionService } from '../services/session.service'
import { BadRequestError } from '../lib/errors'

const VALID_STATUSES: ProgressStatus[] = ['NotStarted', 'InProgress', 'Completed']

export const progressController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress = await progressService.getAll(req.user!.id)
      res.json({ progress })
    } catch (err) {
      next(err)
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { unit, exercise } = req.params
      const { status } = req.body as { status: ProgressStatus }
      if (!VALID_STATUSES.includes(status)) {
        throw new BadRequestError(`Invalid status: ${String(status)}`)
      }
      const updated = await progressService.updateStatus(req.user!.id, unit, exercise, status)
      res.json({ progress: updated })
    } catch (err) {
      next(err)
    }
  },

  async startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { unit, exercise } = req.body as { unit?: string; exercise?: string }
      if (!unit || !exercise) {
        throw new BadRequestError('unit and exercise are required')
      }
      const session = await sessionService.start(req.user!.id, unit, exercise)
      res.json({ session })
    } catch (err) {
      next(err)
    }
  },

  async endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await sessionService.end(req.user!.id)
      res.json({ session })
    } catch (err) {
      next(err)
    }
  },

  async getSessionTotal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { unit, exercise } = req.params
      const totals = await sessionService.getTotals(req.user!.id, unit, exercise)
      res.json(totals)
    } catch (err) {
      next(err)
    }
  },
}
