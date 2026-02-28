jest.mock('../services/auth.service', () => ({
  authService: {
    upsertUser: jest.fn(),
    generateJWT: jest.fn(),
  },
}))

jest.mock('../lib/logger', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), fatal: jest.fn() },
}))

import { Request, Response, NextFunction } from 'express'
import { authController } from '../controllers/auth.controller'
import { authService } from '../services/auth.service'

const mockUpsertUser = authService.upsertUser as jest.MockedFunction<typeof authService.upsertUser>
const mockGenerateJWT = authService.generateJWT as jest.MockedFunction<typeof authService.generateJWT>

function makeRes() {
  const res = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
  } as unknown as Response
  return res
}

const next = jest.fn() as jest.MockedFunction<NextFunction>

beforeEach(() => {
  jest.clearAllMocks()
  process.env.FRONTEND_URL = 'http://localhost:5173'
  process.env.NODE_ENV = 'test'
})

describe('authController.logout', () => {
  it('clears the auth_token cookie and returns { message: "Logged out" }', () => {
    const res = makeRes()
    authController.logout({} as Request, res)
    expect(res.clearCookie).toHaveBeenCalledWith('auth_token', expect.objectContaining({ httpOnly: true }))
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' })
  })
})

describe('authController.getMe', () => {
  it('returns req.user', () => {
    const user = { id: 1, username: 'octocat', avatarUrl: 'https://x.com' }
    const req = { user } as unknown as Request
    const res = makeRes()
    authController.getMe(req, res)
    expect(res.json).toHaveBeenCalledWith(user)
  })
})

describe('authController.handleOAuthCallback', () => {
  it('upserts user, sets auth_token cookie, and redirects to /auth/callback', async () => {
    const fakeUser = { id: 1, github_id: 42, username: 'octocat', avatar_url: 'https://x.com', created_at: new Date() }
    mockUpsertUser.mockResolvedValueOnce(fakeUser)
    mockGenerateJWT.mockReturnValueOnce('signed.jwt.token')

    const req = { user: { id: '42', username: 'octocat', photos: [] } } as unknown as Request
    const res = makeRes()

    await authController.handleOAuthCallback(req, res, next)

    expect(mockUpsertUser).toHaveBeenCalled()
    expect(mockGenerateJWT).toHaveBeenCalledWith(fakeUser)
    expect(res.cookie).toHaveBeenCalledWith('auth_token', 'signed.jwt.token', expect.objectContaining({ httpOnly: true, maxAge: 86400000 }))
    expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/auth/callback')
  })

  it('calls next(err) if authService throws', async () => {
    mockUpsertUser.mockRejectedValueOnce(new Error('DB error'))
    const req = { user: { id: '42', username: 'octocat', photos: [] } } as unknown as Request
    const res = makeRes()

    await authController.handleOAuthCallback(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })
})
