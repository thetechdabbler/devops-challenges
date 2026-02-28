import { sessionRepository } from '../repositories/session.repository'

export const sessionService = {
  async start(userId: number, unit: string, exercise: string) {
    const active = await sessionRepository.findActive(userId)
    if (active) {
      await sessionRepository.end(active.id, active.started_at)
    }
    return sessionRepository.create(userId, unit, exercise)
  },

  async end(userId: number) {
    const active = await sessionRepository.findActive(userId)
    if (!active) return null
    return sessionRepository.end(active.id, active.started_at)
  },

  async getTotals(userId: number, unit: string, exercise: string) {
    const [totalSeconds, active] = await Promise.all([
      sessionRepository.getTotalSeconds(userId, unit, exercise),
      sessionRepository.findActiveForExercise(userId, unit, exercise),
    ])
    return {
      totalSeconds,
      isActive: !!active,
      activeStartedAt: active?.started_at ?? null,
    }
  },
}
