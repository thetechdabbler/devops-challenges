import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  InternalError,
} from '../lib/errors'

describe('AppError subclasses', () => {
  it('NotFoundError has correct code and statusCode', () => {
    const err = new NotFoundError('Exercise not found')
    expect(err).toBeInstanceOf(AppError)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.statusCode).toBe(404)
    expect(err.message).toBe('Exercise not found')
  })

  it('UnauthorizedError has correct code and statusCode', () => {
    const err = new UnauthorizedError()
    expect(err.code).toBe('UNAUTHORIZED')
    expect(err.statusCode).toBe(401)
  })

  it('ForbiddenError has correct code and statusCode', () => {
    const err = new ForbiddenError()
    expect(err.code).toBe('FORBIDDEN')
    expect(err.statusCode).toBe(403)
  })

  it('BadRequestError has correct code and statusCode', () => {
    const err = new BadRequestError('Invalid status value')
    expect(err.code).toBe('BAD_REQUEST')
    expect(err.statusCode).toBe(400)
    expect(err.message).toBe('Invalid status value')
  })

  it('InternalError has correct code and statusCode', () => {
    const err = new InternalError()
    expect(err.code).toBe('INTERNAL_ERROR')
    expect(err.statusCode).toBe(500)
  })

  it('AppError is instanceof Error', () => {
    const err = new NotFoundError()
    expect(err).toBeInstanceOf(Error)
  })
})
