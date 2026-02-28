import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'
import { log } from '../lib/logger'

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      log.error({ err }, err.message)
    } else {
      log.warn({ code: err.code, message: err.message }, '4xx error')
    }
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
    return
  }

  // Unknown error — redact message in production
  log.error({ err }, 'Unhandled error')
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message,
    },
  })
}
