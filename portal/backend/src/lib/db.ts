import { prisma } from './prisma'
import { log } from './logger'

export async function connectWithRetry(
  maxAttempts = 10,
  delayMs = 2000
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$connect()
      log.info(`Database connected on attempt ${attempt}`)
      return
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      log.warn(`DB connection attempt ${attempt}/${maxAttempts} failed: ${message}`)
      if (attempt < maxAttempts) {
        await new Promise<void>(resolve => setTimeout(resolve, delayMs))
      }
    }
  }
  log.fatal(`Could not connect to database after ${maxAttempts} attempts`)
  process.exit(1)
}
