import { ProgressStatus } from '@prisma/client'
import { progressRepository } from '../repositories/progress.repository'

export const progressService = {
  async getAll(userId: number) {
    return progressRepository.findAll(userId)
  },

  async updateStatus(userId: number, unit: string, exercise: string, status: ProgressStatus) {
    return progressRepository.upsertStatus(userId, unit, exercise, status)
  },
}
