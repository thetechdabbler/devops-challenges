import { QuestionStatus } from '@prisma/client'
import { questionRepository } from '../repositories/question.repository'
import { aiQuestionGenerator } from '../lib/question-bank/ai-generator'
import { log } from '../lib/logger'
import {
  GenerationConfig,
  BulkGenerationResult,
  BankStats,
  PaginatedResult,
  ReviewAction,
  Question,
} from '../lib/question-bank/types'

const MAX_BULK_COUNT = 50

export const adminQuestionService = {
  /**
   * Generates questions via OpenAI and saves them as pending_review.
   * count is clamped to MAX_BULK_COUNT.
   */
  async bulkGenerate(config: GenerationConfig, _adminId: number): Promise<BulkGenerationResult> {
    const clamped = Math.min(config.count, MAX_BULK_COUNT)
    const effectiveConfig = { ...config, count: clamped }
    const wasWarned = config.count > MAX_BULK_COUNT

    if (wasWarned) {
      log.warn({ requested: config.count, clamped }, 'Bulk generation count clamped to maximum')
    }

    let saved = 0
    let errors = 0

    try {
      const result = await aiQuestionGenerator.generate(effectiveConfig)
      if (result.questions.length > 0) {
        const ids = await questionRepository.saveGenerated(result.questions, 'admin')
        saved = ids.length
      }
    } catch (err) {
      log.error({ err }, 'Bulk generation failed')
      errors = clamped
    }

    return { requested: clamped, saved, errors }
  },

  /**
   * Approves or rejects a question. Idempotent — repeated actions are safe.
   * Optionally updates question text on approve.
   */
  async reviewQuestion(
    id: string,
    action: ReviewAction,
    adminId: number,
    text?: string
  ): Promise<Question> {
    const newStatus = action === 'approve' ? QuestionStatus.active : QuestionStatus.rejected
    return questionRepository.updateReview(id, newStatus, adminId, text)
  },

  /**
   * Paginated list of questions by status — for admin review queue.
   */
  async listByStatus(
    status: QuestionStatus,
    cursor?: string,
    limit = 20
  ): Promise<PaginatedResult<Question>> {
    const result = await questionRepository.findByStatus(status, cursor, limit)
    return {
      items: result.questions,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    }
  },

  /**
   * Aggregated bank statistics — single query.
   */
  async getStats(): Promise<BankStats> {
    return questionRepository.getStats()
  },
}
