jest.mock('../services/auth.service', () => ({
  authService: {
    verifyJWT: jest.fn(),
  },
}))

import { Request, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authService } from '../services/auth.service'
import { TokenExpiredError, UnauthorizedError } from '../lib/errors'

const mockVerifyJWT = authService.verifyJWT as jest.MockedFunction<typeof authService.verifyJWT>

function makeReq(cookies: Record<string, string> = {}): Request {
  return { cookies } as unknown as Request
}

const next = jest.fn() as jest.MockedFunction<NextFunction>

beforeEach(() => jest.clearAllMocks())

describe('authenticate middleware', () => {
  it('calls next(UnauthorizedError) when auth_token cookie is absent', () => {
    authenticate(makeReq(), {} as Response, next)
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError))
  })

  it('sets req.user and calls next() for a valid token', () => {
    const payload = { id: 1, username: 'octocat', avatarUrl: 'https://x.com' }
    mockVerifyJWT.mockReturnValueOnce(payload)
    const req = makeReq({ auth_token: 'valid.token.here' })

    authenticate(req, {} as Response, next)

    expect(req.user).toEqual(payload)
    expect(next).toHaveBeenCalledWith()
  })

  it('calls next(TokenExpiredError) when token is expired', () => {
    mockVerifyJWT.mockImplementationOnce(() => { throw new TokenExpiredError() })
    authenticate(makeReq({ auth_token: 'expired.token' }), {} as Response, next)
    expect(next).toHaveBeenCalledWith(expect.any(TokenExpiredError))
  })

  it('calls next(UnauthorizedError) when token signature is invalid', () => {
    mockVerifyJWT.mockImplementationOnce(() => { throw new UnauthorizedError('Invalid token') })
    authenticate(makeReq({ auth_token: 'bad.token' }), {} as Response, next)
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError))
  })
})
