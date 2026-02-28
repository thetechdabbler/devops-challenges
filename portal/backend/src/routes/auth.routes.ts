import { Router } from 'express'
import passport from 'passport'
import { authController } from '../controllers/auth.controller'
import { log } from '../lib/logger'

// Mounted at /auth — handles the GitHub OAuth dance (public, no JWT required)
export const oauthRouter = Router()

// Step 1: Redirect browser to GitHub for authorisation
oauthRouter.get('/github', passport.authenticate('github', { scope: [], session: false }))

// Step 2: GitHub redirects back; Passport exchanges code for token and fetches profile
oauthRouter.get(
  '/github/callback',
  (req, res, next) => {
    passport.authenticate('github', { session: false }, (err: Error | null, profile: unknown) => {
      if (err || !profile) {
        log.error({ err, profile }, 'GitHub OAuth callback failed')
        return res.redirect(`${process.env.FRONTEND_URL ?? ''}/?error=auth_failed`)
      }
      // Temporarily attach the GitHub profile so handleOAuthCallback can read it
      ;(req as any).user = profile
      next()
    })(req, res, next)
  },
  authController.handleOAuthCallback
)
