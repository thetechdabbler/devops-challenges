import { request } from './client'
import { ExperienceLevel, InterviewTopic, QuestionType } from './interview.api'

export type TransferQuestionStatus = 'pending_review' | 'active' | 'rejected'

export type QuestionTransferFilters = {
  topics?: InterviewTopic[]
  type?: QuestionType
  difficulty?: number
  experienceLevel?: ExperienceLevel
  status?: TransferQuestionStatus
}

export type ImportMode = 'dry-run' | 'apply'

export type TransferIssue = {
  rowIndex: number
  field: string
  code: string
  message: string
}

export type TransferResult = {
  summary: {
    totalRows: number
    validRows: number
    invalidRows: number
    insertedRows: number
    duplicateRows: number
    mode: ImportMode
  }
  issues: TransferIssue[]
}

function toMessageFromBody(body: unknown, fallback: string): string {
  if (typeof body !== 'object' || body === null) return fallback
  const asRecord = body as Record<string, unknown>
  const direct = asRecord.message
  if (typeof direct === 'string') return direct
  const err = asRecord.error
  if (typeof err === 'object' && err !== null) {
    const nested = (err as Record<string, unknown>).message
    if (typeof nested === 'string') return nested
  }
  return fallback
}

export async function exportQuestionsCsv(filters: QuestionTransferFilters): Promise<Blob> {
  const query = new URLSearchParams()
  if (filters.topics && filters.topics.length > 0) query.set('topics', filters.topics.join(','))
  if (filters.type) query.set('type', filters.type)
  if (typeof filters.difficulty === 'number') query.set('difficulty', String(filters.difficulty))
  if (filters.experienceLevel) query.set('experience_level', filters.experienceLevel)
  if (filters.status) query.set('status', filters.status)

  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
  const qs = query.toString()
  const path = qs ? `/api/v1/questions/export?${qs}` : '/api/v1/questions/export'
  const res = await fetch(`${base}${path}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(toMessageFromBody(body, `Export failed (${res.status})`))
  }

  return res.blob()
}

export async function importQuestionsCsv(payload: {
  mode: ImportMode
  csv: string
}): Promise<TransferResult> {
  const response = await request<{ status: string; data: TransferResult }>('/api/v1/questions/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}
