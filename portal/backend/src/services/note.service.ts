import { noteRepository } from '../repositories/note.repository'

export const noteService = {
  async getAll(userId: number) {
    return noteRepository.findAll(userId)
  },

  async getNote(userId: number, unit: string | null, exercise: string | null) {
    return noteRepository.findNote(userId, unit, exercise)
  },

  async upsertNote(userId: number, unit: string | null, exercise: string | null, content: string) {
    return noteRepository.upsertNote(userId, unit, exercise, content)
  },
}
