import http from 'http'
import { prisma } from './prisma'
import { log } from './logger'

export function registerGracefulShutdown(server: http.Server): void {
  const shutdown = () => {
    log.info('Shutdown signal received — draining connections')
    server.close(async () => {
      await prisma.$disconnect()
      log.info('Shutdown complete')
      process.exit(0)
    })
    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      log.error('Graceful shutdown timed out — forcing exit')
      process.exit(1)
    }, 5000)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}
