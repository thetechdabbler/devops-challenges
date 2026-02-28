import { ProgressStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'

export const progressRepository = {
  async findAll(userId: number) {
    return prisma.exerciseProgress.findMany({ where: { user_id: userId } })
  },

  async upsertStatus(userId: number, unit: string, exercise: string, status: ProgressStatus) {
    return prisma.exerciseProgress.upsert({
      where: { user_id_unit_exercise: { user_id: userId, unit, exercise } },
      create: { user_id: userId, unit, exercise, status },
      update: { status },
    })
  },
}
