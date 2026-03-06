import {
  Topic,
  QuestionType,
  ExperienceLevel,
  QuestionSource,
  QuestionStatus,
} from '@prisma/client'

export { Topic, QuestionType, ExperienceLevel, QuestionSource, QuestionStatus }

/**
 * Safe projection — used for session delivery.
 * Does NOT include answer, explanation, or keyConcepts (ADR-002).
 */
export type QuestionSummary = {
  id: string
  text: string
  type: QuestionType
  topics: Topic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  source: QuestionSource
  status: QuestionStatus
  createdAt: Date
}

/**
 * Full question — includes sensitive fields.
 * Used ONLY in the answer reveal flow (Bolt 005).
 */
export type Question = QuestionSummary & {
  answer: string
  explanation: string
  keyConcepts: string[]
}

export type SessionConfig = {
  topics: Topic[]
  difficulty: number      // 1–5
  experienceLevel: ExperienceLevel
  count: number           // 5–20
}

export type QuestionFetchResult = {
  questions: QuestionSummary[]
  gapCount: number        // > 0 means AI could not fill request fully (ADR-004)
}

/**
 * Transient — output of OpenAI generation before persistence.
 * Always includes answer/explanation (full question shape).
 */
export type GeneratedQuestion = {
  text: string
  type: QuestionType
  topics: Topic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  answer: string
  explanation: string
  keyConcepts: string[]
}

export type GenerationConfig = {
  topics: Topic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  count: number
  type?: QuestionType  // when set, AI generates only this question type (ADR-008 type-targeted gap-fill)
}

export type GenerationResult = {
  questions: GeneratedQuestion[]
  requestedCount: number
}

export type BulkGenerationResult = {
  requested: number
  saved: number
  errors: number
}

export type BankStats = {
  byTopic: Record<string, number>
  byDifficulty: Record<number, number>
  byType: Record<string, number>
  byStatus: Record<string, number>
  pendingReview: number
}

export type PaginatedResult<T> = {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export type ReviewAction = 'approve' | 'reject'

/**
 * Controls how AI-generated questions enter the bank.
 * session → status=active (immediately usable)
 * admin   → status=pending_review (quarantined until approved)
 */
export type SaveMode = 'session' | 'admin'
