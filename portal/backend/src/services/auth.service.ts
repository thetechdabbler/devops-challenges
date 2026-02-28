import jwt from 'jsonwebtoken'
import { User } from '@prisma/client'
import { Profile as GitHubProfile } from 'passport-github2'
import { userRepository } from '../repositories/user.repository'
import { TokenExpiredError, UnauthorizedError } from '../lib/errors'

export interface JwtPayload {
  id: number
  username: string
  avatarUrl: string
}

export const authService = {
  async upsertUser(profile: GitHubProfile): Promise<User> {
    return userRepository.upsert({
      githubId: parseInt(profile.id, 10),
      username: profile.username ?? '',
      avatarUrl: profile.photos?.[0]?.value ?? '',
    })
  },

  generateJWT(user: User): string {
    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar_url,
    }
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' })
  },

  verifyJWT(token: string): JwtPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError()
      }
      throw new UnauthorizedError('Invalid token')
    }
  },
}
