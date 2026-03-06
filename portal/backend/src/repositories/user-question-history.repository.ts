import { prisma } from '../lib/prisma'

const DEDUP_WINDOW_DAYS = 30

export const userQuestionHistoryRepository = {
  /**
   * Returns question IDs seen by this user within the last 30 days.
   */
  async findRecentIds(userId: number): Promise<Set<string>> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - DEDUP_WINDOW_DAYS)

    const rows = await prisma.userQuestionHistory.findMany({
      where: {
        user_id: userId,
        seen_at: { gte: cutoff },
      },
      select: { question_id: true },
    })

    return new Set(rows.map(r => r.question_id))
  },

  /**
   * Records that a user has seen the given questions (batch insert).
   */
  async recordSeen(userId: number, questionIds: string[]): Promise<void> {
    if (questionIds.length === 0) return

    await prisma.userQuestionHistory.createMany({
      data: questionIds.map(question_id => ({ user_id: userId, question_id })),
      skipDuplicates: true,
    })
  },
}
