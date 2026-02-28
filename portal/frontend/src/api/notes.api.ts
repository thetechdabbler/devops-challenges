import { request } from './client'

export interface Note {
  id: number
  user_id: number
  unit: string | null
  exercise: string | null
  content: string
  updated_at: string
}

export async function fetchNote(unit: string | null, exercise: string | null): Promise<Note | null> {
  const path =
    unit === null ? '/api/notes/global'
    : exercise === null ? `/api/notes/${unit}`
    : `/api/notes/${unit}/${exercise}`
  const { note } = await request<{ note: Note | null }>(path)
  return note
}

export async function upsertNote(unit: string, exercise: string, content: string): Promise<Note> {
  const { note } = await request<{ note: Note }>(
    `/api/notes/${unit}/${exercise}`,
    { method: 'PUT', body: JSON.stringify({ content }) }
  )
  return note
}
