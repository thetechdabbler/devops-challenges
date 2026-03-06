import { Request, Response, NextFunction } from 'express'
import { requireReviewer } from '../middleware/reviewer.middleware'
import { ForbiddenError } from '../lib/errors'

function mockReq(role?: string): Request {
  return { user: role ? { id: 1, username: 'u', avatarUrl: '', role } : undefined } as unknown as Request
}

const next = jest.fn() as unknown as NextFunction

beforeEach(() => jest.clearAllMocks())

describe('requireReviewer', () => {
  it('allows reviewer role', () => {
    requireReviewer(mockReq('reviewer'), {} as Response, next)
    expect(next).toHaveBeenCalledWith()
  })

  it('blocks non-reviewer role', () => {
    requireReviewer(mockReq('admin'), {} as Response, next)
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError))
  })

  it('blocks unauthenticated user context', () => {
    requireReviewer(mockReq(), {} as Response, next)
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError))
  })
})
