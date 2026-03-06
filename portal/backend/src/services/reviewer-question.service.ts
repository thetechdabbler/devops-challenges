import { Question } from '../lib/question-bank/types'
import { questionRepository } from '../repositories/question.repository'
import {
  ReviewerQuestionCreateInput,
  ReviewerQuestionConflict,
  ReviewerQuestionCursor,
  ReviewerQuestionListFilters,
  ReviewerQuestionUpdateInput,
} from '../lib/reviewer-question/types'

export const reviewerQuestionService = {
  async createQuestion(payload: ReviewerQuestionCreateInput, actorId: number): Promise<Question> {
    return questionRepository.createReviewerQuestion(payload, actorId)
  },

  async listQuestions(
    filters: ReviewerQuestionListFilters,
    cursor?: ReviewerQuestionCursor,
    limit = 20
  ): Promise<{ items: Question[]; nextCursor: ReviewerQuestionCursor | null; hasMore: boolean }> {
    const result = await questionRepository.findForReviewerList(filters, cursor, limit)
    return {
      items: result.questions,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    }
  },

  async updateQuestion(
    id: string,
    revisionToken: number,
    patch: ReviewerQuestionUpdateInput,
    actorId: number
  ): Promise<
    | { kind: 'updated'; question: Question }
    | { kind: 'conflict'; latest: Question; conflict: ReviewerQuestionConflict }
    | { kind: 'not_found' }
  > {
    return questionRepository.updateReviewerQuestion(id, revisionToken, patch, actorId)
  },

  async archiveQuestion(
    id: string,
    actorId: number
  ): Promise<{ kind: 'archived'; question: Question; idempotent: boolean } | { kind: 'not_found' }> {
    return questionRepository.archiveReviewerQuestion(id, actorId)
  },

  async listAuditEvents(questionId: string, limit?: number) {
    return questionRepository.listQuestionAuditEvents(questionId, limit)
  },
}
