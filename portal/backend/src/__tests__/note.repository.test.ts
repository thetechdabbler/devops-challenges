jest.mock('../lib/prisma', () => ({
  prisma: {
    note: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

import { noteRepository } from '../repositories/note.repository'
import { prisma } from '../lib/prisma'

const mockFindMany = prisma.note.findMany as jest.MockedFunction<typeof prisma.note.findMany>
const mockFindFirst = prisma.note.findFirst as jest.MockedFunction<typeof prisma.note.findFirst>
const mockCreate = prisma.note.create as jest.MockedFunction<typeof prisma.note.create>
const mockUpdate = prisma.note.update as jest.MockedFunction<typeof prisma.note.update>

const fakeNote = {
  id: 1, user_id: 7, unit: 'docker', exercise: '01-intro',
  content: '# My notes', updated_at: new Date(),
}

beforeEach(() => jest.clearAllMocks())

describe('noteRepository.findAll', () => {
  it('returns all notes for a user', async () => {
    mockFindMany.mockResolvedValueOnce([fakeNote])
    const result = await noteRepository.findAll(7)
    expect(mockFindMany).toHaveBeenCalledWith({ where: { user_id: 7 } })
    expect(result).toEqual([fakeNote])
  })
})

describe('noteRepository.findNote', () => {
  it('returns a note when found', async () => {
    mockFindFirst.mockResolvedValueOnce(fakeNote)
    const result = await noteRepository.findNote(7, 'docker', '01-intro')
    expect(mockFindFirst).toHaveBeenCalledWith({ where: { user_id: 7, unit: 'docker', exercise: '01-intro' } })
    expect(result).toEqual(fakeNote)
  })

  it('returns null when no note exists', async () => {
    mockFindFirst.mockResolvedValueOnce(null)
    const result = await noteRepository.findNote(7, null, null)
    expect(result).toBeNull()
  })
})

describe('noteRepository.upsertNote', () => {
  it('creates a new note when none exists', async () => {
    mockFindFirst.mockResolvedValueOnce(null)
    mockCreate.mockResolvedValueOnce({ ...fakeNote, content: 'new content' })
    const result = await noteRepository.upsertNote(7, 'docker', '01-intro', 'new content')
    expect(mockCreate).toHaveBeenCalledWith({
      data: { user_id: 7, unit: 'docker', exercise: '01-intro', content: 'new content' },
    })
    expect(result.content).toBe('new content')
  })

  it('updates an existing note', async () => {
    mockFindFirst.mockResolvedValueOnce(fakeNote)
    mockUpdate.mockResolvedValueOnce({ ...fakeNote, content: 'updated' })
    const result = await noteRepository.upsertNote(7, 'docker', '01-intro', 'updated')
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: fakeNote.id },
      data: { content: 'updated' },
    })
    expect(result.content).toBe('updated')
  })
})
