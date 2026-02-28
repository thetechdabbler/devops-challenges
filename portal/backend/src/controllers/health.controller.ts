import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { log } from '../lib/logger'

export async function check(_req: Request, res: Response): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.status(200).json({ status: 'ok', db: 'connected' })
  } catch (err) {
    log.warn({ err }, 'Health check DB query failed')
    res.status(503).json({ status: 'degraded', db: 'unreachable' })
  }
}
