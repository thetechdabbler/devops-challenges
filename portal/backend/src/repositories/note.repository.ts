import { prisma } from '../lib/prisma'

export const noteRepository = {
  async findAll(userId: number) {
    return prisma.note.findMany({ where: { user_id: userId } })
  },

  async findNote(userId: number, unit: string | null, exercise: string | null) {
    return prisma.note.findFirst({ where: { user_id: userId, unit, exercise } })
  },

  async upsertNote(userId: number, unit: string | null, exercise: string | null, content: string) {
    const existing = await prisma.note.findFirst({ where: { user_id: userId, unit, exercise } })
    if (existing) {
      return prisma.note.update({ where: { id: existing.id }, data: { content } })
    }
    return prisma.note.create({ data: { user_id: userId, unit, exercise, content } })
  },
}
