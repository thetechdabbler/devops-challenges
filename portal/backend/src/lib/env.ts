import { log } from './logger'

const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_CALLBACK_URL',
  'FRONTEND_URL',
  'CONTENT_PATH',
  'PORT',
] as const

export function validateEnv(): void {
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      log.fatal(`Missing required environment variable: ${varName}`)
      process.exit(1)
    }
  }
}
