import { Request, Response, NextFunction } from 'express'
import { ForbiddenError } from '../lib/errors'

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    next(new ForbiddenError('Admin access required'))
    return
  }
  next()
}
