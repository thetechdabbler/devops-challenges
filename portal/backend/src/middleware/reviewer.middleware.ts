import { Request, Response, NextFunction } from 'express'
import { ForbiddenError } from '../lib/errors'

export function requireReviewer(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'reviewer') {
    next(new ForbiddenError('Reviewer access required'))
    return
  }
  next()
}
