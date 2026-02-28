import { Request, Response, NextFunction } from 'express'
import { Profile as GitHubProfile } from 'passport-github2'
import { authService } from '../services/auth.service'
import { log } from '../lib/logger'

function cookieOptions(res: Response) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  }
}

export const authController = {
  handleOAuthCallback: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = req.user as unknown as GitHubProfile
      const user = await authService.upsertUser(profile)
      const token = authService.generateJWT(user)
      res.cookie('auth_token', token, cookieOptions(res))
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
    } catch (err) {
      log.error({ err }, 'OAuth callback error')
      next(err)
    }
  },

  logout: (_req: Request, res: Response): void => {
    res.clearCookie('auth_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
    res.json({ message: 'Logged out' })
  },

  getMe: (req: Request, res: Response): void => {
    res.json(req.user)
  },
}
