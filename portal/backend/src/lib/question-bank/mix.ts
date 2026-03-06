import { QuestionSummary } from './types'

/**
 * Minimum questions required per type for a session of `count` questions.
 * Rule: max(2, floor(count × 0.30))
 * Examples: count=5 → 2, count=10 → 3, count=20 → 6
 */
export function minPerType(count: number): number {
  return Math.max(2, Math.floor(count * 0.30))
}

/**
 * Computes theory/scenario gaps given a set of questions and target count.
 * Returns gaps of 0 when the mix constraint is satisfied (ADR-008).
 */
export function enforceMix(
  questions: QuestionSummary[],
  count: number
): { theoryGap: number; scenarioGap: number } {
  const min = minPerType(count)
  const theoryCount = questions.filter(q => q.type === 'theory').length
  const scenarioCount = questions.filter(q => q.type === 'scenario').length
  return {
    theoryGap: Math.max(0, min - theoryCount),
    scenarioGap: Math.max(0, min - scenarioCount),
  }
}
