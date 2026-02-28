jest.mock('../repositories/user.repository', () => ({
  userRepository: {
    upsert: jest.fn(),
  },
}))

jest.mock('../lib/logger', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), fatal: jest.fn() },
}))

import jwt from 'jsonwebtoken'
import { authService } from '../services/auth.service'
import { userRepository } from '../repositories/user.repository'
import { TokenExpiredError, UnauthorizedError } from '../lib/errors'

const mockUpsert = userRepository.upsert as jest.MockedFunction<typeof userRepository.upsert>

const JWT_SECRET = 'test_secret_32_chars_long_for_hs256'

beforeEach(() => {
  process.env.JWT_SECRET = JWT_SECRET
})

const fakeUser = {
  id: 1,
  github_id: 12345,
  username: 'octocat',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345',
  created_at: new Date(),
}

describe('authService.upsertUser', () => {
  it('calls userRepository.upsert with parsed github_id and returns user', async () => {
    mockUpsert.mockResolvedValueOnce(fakeUser)
    const profile = {
      id: '12345',
      username: 'octocat',
      photos: [{ value: 'https://avatars.githubusercontent.com/u/12345' }],
    } as any

    const result = await authService.upsertUser(profile)

    expect(mockUpsert).toHaveBeenCalledWith({
      githubId: 12345,
      username: 'octocat',
      avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
    })
    expect(result).toEqual(fakeUser)
  })
})

describe('authService.generateJWT', () => {
  it('returns a signed JWT containing id, username, avatarUrl', () => {
    const token = authService.generateJWT(fakeUser)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    expect(decoded.id).toBe(fakeUser.id)
    expect(decoded.username).toBe(fakeUser.username)
    expect(decoded.avatarUrl).toBe(fakeUser.avatar_url)
  })
})

describe('authService.verifyJWT', () => {
  it('returns payload for a valid token', () => {
    const token = jwt.sign({ id: 1, username: 'octocat', avatarUrl: 'https://x.com' }, JWT_SECRET, { expiresIn: '1h' })
    const payload = authService.verifyJWT(token)
    expect(payload.id).toBe(1)
    expect(payload.username).toBe('octocat')
  })

  it('throws TokenExpiredError for an expired token', () => {
    const token = jwt.sign({ id: 1, username: 'octocat', avatarUrl: '' }, JWT_SECRET, { expiresIn: -1 })
    expect(() => authService.verifyJWT(token)).toThrow(TokenExpiredError)
  })

  it('throws UnauthorizedError for a malformed token', () => {
    expect(() => authService.verifyJWT('not.a.valid.jwt')).toThrow(UnauthorizedError)
  })
})
