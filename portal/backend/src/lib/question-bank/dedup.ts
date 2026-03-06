import { userQuestionHistoryRepository } from '../../repositories/user-question-history.repository'
import { QuestionSummary } from './types'

/**
 * Filters out questions the user has seen in the last 30 days.
 */
export async function filterUnseen(
  userId: number,
  candidates: QuestionSummary[]
): Promise<QuestionSummary[]> {
  if (candidates.length === 0) return []

  const seenIds = await userQuestionHistoryRepository.findRecentIds(userId)
  return candidates.filter(q => !seenIds.has(q.id))
}
