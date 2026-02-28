import { NextFunction, Request, Response } from 'express'
import { noteService } from '../services/note.service'
import { BadRequestError } from '../lib/errors'

export const noteController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notes = await noteService.getAll(req.user!.id)
      res.json({ notes })
    } catch (err) {
      next(err)
    }
  },

  async getNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = req.params.unit ?? null
      const exercise = req.params.exercise ?? null
      const note = await noteService.getNote(req.user!.id, unit, exercise)
      res.json({ note })
    } catch (err) {
      next(err)
    }
  },

  async upsertNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = req.params.unit ?? null
      const exercise = req.params.exercise ?? null
      const { content } = req.body as { content?: string }
      if (typeof content !== 'string') {
        throw new BadRequestError('content must be a string')
      }
      const note = await noteService.upsertNote(req.user!.id, unit, exercise, content)
      res.json({ note })
    } catch (err) {
      next(err)
    }
  },
}
