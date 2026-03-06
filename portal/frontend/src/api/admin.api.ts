import { request } from './client'
import { ExperienceLevel, InterviewTopic, QuestionType } from './interview.api'

export type AdminQuestionStatus = 'pending_review' | 'active' | 'rejected'

export type AdminQuestion = {
  id: string
  text: string
  type: QuestionType
  topics: InterviewTopic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  source: 'bank' | 'ai'
  status: AdminQuestionStatus
  createdAt: string
  answer: string
  explanation: string
  keyConcepts: string[]
}

export type BankStats = {
  byTopic: Record<string, number>
  byDifficulty: Record<number, number>
  byType: Record<string, number>
  byStatus: Record<string, number>
  pendingReview: number
}

export async function fetchAdminStats(): Promise<BankStats> {
  const response = await request<{ status: string; data: BankStats }>('/api/v1/admin/questions/stats')
  return response.data
}

export async function generateAdminQuestions(config: {
  topics: InterviewTopic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  count: number
}): Promise<{ requested: number; saved: number; errors: number }> {
  const response = await request<{ status: string; data: { requested: number; saved: number; errors: number } }>(
    '/api/v1/admin/questions/generate',
    {
      method: 'POST',
      body: JSON.stringify(config),
    }
  )
  return response.data
}

export async function fetchAdminReviewQueue(
  status: AdminQuestionStatus = 'pending_review',
  cursor?: string,
  limit = 20
): Promise<{ items: AdminQuestion[]; nextCursor: string | null; hasMore: boolean }> {
  const query = new URLSearchParams()
  query.set('status', status)
  query.set('limit', String(limit))
  if (cursor) query.set('cursor', cursor)

  const response = await request<{
    status: string
    data: { items: AdminQuestion[]; nextCursor: string | null; hasMore: boolean }
  }>(`/api/v1/admin/questions?${query.toString()}`)

  return response.data
}

export async function reviewAdminQuestion(
  id: string,
  action: 'approve' | 'reject'
): Promise<AdminQuestion> {
  const response = await request<{ status: string; data: AdminQuestion }>(`/api/v1/admin/questions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  })
  return response.data
}
