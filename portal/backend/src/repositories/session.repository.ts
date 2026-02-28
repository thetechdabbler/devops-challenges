import { prisma } from '../lib/prisma'

export const sessionRepository = {
  async create(userId: number, unit: string, exercise: string) {
    return prisma.session.create({
      data: { user_id: userId, unit, exercise },
    })
  },

  async findActive(userId: number) {
    return prisma.session.findFirst({ where: { user_id: userId, is_active: true } })
  },

  async findActiveForExercise(userId: number, unit: string, exercise: string) {
    return prisma.session.findFirst({
      where: { user_id: userId, unit, exercise, is_active: true },
    })
  },

  async end(sessionId: number, startedAt: Date) {
    const now = new Date()
    const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
    return prisma.session.update({
      where: { id: sessionId },
      data: { ended_at: now, duration_seconds: durationSeconds, is_active: false },
    })
  },

  async getTotalSeconds(userId: number, unit: string, exercise: string): Promise<number> {
    const result = await prisma.session.aggregate({
      where: { user_id: userId, unit, exercise, is_active: false },
      _sum: { duration_seconds: true },
    })
    return result._sum.duration_seconds ?? 0
  },
}
