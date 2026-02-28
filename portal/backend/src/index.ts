import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import passport from 'passport'
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2'

import { validateEnv } from './lib/env'
import { connectWithRetry } from './lib/db'
import { log } from './lib/logger'
import { errorMiddleware } from './middleware/error.middleware'
import { registerGracefulShutdown } from './lib/shutdown'
import healthRouter from './routes/health'
import { oauthRouter } from './routes/auth.routes'
import { authenticate } from './middleware/auth.middleware'
import { authController } from './controllers/auth.controller'
import { contentService } from './services/content.service'
import contentRouter from './routes/content.routes'
import progressRouter from './routes/progress.routes'
import noteRouter from './routes/note.routes'

async function main() {
  // 1. Validate all required environment variables (fail-fast)
  validateEnv()

  // 2. Connect to PostgreSQL with retry
  await connectWithRetry()

  // 3. Initialise content index (fail-fast if CONTENT_PATH missing)
  contentService.initialize()

  // 3. Create Express application
  const app = express()

  // 4. Global middleware (order matters)
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  )

  // 5. Passport — initialise (session: false; JWT cookie is the session mechanism)
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: process.env.GITHUB_CALLBACK_URL!,
      },
      (_accessToken: string, _refreshToken: string, profile: GitHubProfile, done: (err: null, user: GitHubProfile) => void) => {
        done(null, profile)
      }
    )
  )
  app.use(passport.initialize())

  // 6. Routes
  app.use('/health', healthRouter)
  app.use('/auth', oauthRouter)                        // GitHub OAuth dance (public)
  app.post('/api/auth/logout', authController.logout)  // Logout — exempt from authenticate
  app.get('/api/me', authenticate, authController.getMe)
  app.use('/api/content', authenticate, contentRouter)
  app.use('/api/progress', authenticate, progressRouter)
  app.use('/api/notes', authenticate, noteRouter)
  // Notes routes registered in Unit 5

  // 7. Error middleware — MUST be registered last
  app.use(errorMiddleware)

  // 7. Start HTTP server
  const port = parseInt(process.env.PORT ?? '3001', 10)
  const server = app.listen(port, () => {
    log.info(`Server listening on port ${port}`)
  })

  // 8. Register graceful shutdown handlers
  registerGracefulShutdown(server)
}

main().catch(err => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
