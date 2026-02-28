import { request } from './client'

export type ProgressStatus = 'NotStarted' | 'InProgress' | 'Completed'

export interface ExerciseProgress {
  id: number
  user_id: number
  unit: string
  exercise: string
  status: ProgressStatus
  updated_at: string
}

export interface Session {
  id: number
  user_id: number
  unit: string
  exercise: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  is_active: boolean
}

export interface SessionTotals {
  totalSeconds: number
  isActive: boolean
  activeStartedAt: string | null
}

export async function fetchProgress(): Promise<ExerciseProgress[]> {
  const { progress } = await request<{ progress: ExerciseProgress[] }>('/api/progress')
  return progress
}

export async function updateStatus(unit: string, exercise: string, status: ProgressStatus): Promise<ExerciseProgress> {
  const { progress } = await request<{ progress: ExerciseProgress }>(
    `/api/progress/${unit}/${exercise}`,
    { method: 'PUT', body: JSON.stringify({ status }) }
  )
  return progress
}

export async function startSession(unit: string, exercise: string): Promise<Session> {
  const { session } = await request<{ session: Session }>(
    '/api/progress/sessions/start',
    { method: 'POST', body: JSON.stringify({ unit, exercise }) }
  )
  return session
}

export async function endSession(): Promise<Session | null> {
  const { session } = await request<{ session: Session | null }>(
    '/api/progress/sessions/end',
    { method: 'POST', body: JSON.stringify({}) }
  )
  return session
}

export async function getSessionTotal(unit: string, exercise: string): Promise<SessionTotals> {
  return request<SessionTotals>(`/api/progress/sessions/${unit}/${exercise}/total`)
}
