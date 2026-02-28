import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { UnauthorizedError } from '../lib/errors'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies['auth_token'] as string | undefined

  if (!token) {
    next(new UnauthorizedError('Authentication required'))
    return
  }

  try {
    const payload = authService.verifyJWT(token)
    req.user = { id: payload.id, username: payload.username, avatarUrl: payload.avatarUrl }
    next()
  } catch (err) {
    next(err)
  }
}
