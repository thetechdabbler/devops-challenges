jest.mock('../services/note.service', () => ({
  noteService: {
    getAll: jest.fn(),
    getNote: jest.fn(),
    upsertNote: jest.fn(),
  },
}))

import { Request, Response, NextFunction } from 'express'
import { noteController } from '../controllers/note.controller'
import { noteService } from '../services/note.service'
import { BadRequestError } from '../lib/errors'

const mockGetAll = noteService.getAll as jest.MockedFunction<typeof noteService.getAll>
const mockGetNote = noteService.getNote as jest.MockedFunction<typeof noteService.getNote>
const mockUpsertNote = noteService.upsertNote as jest.MockedFunction<typeof noteService.upsertNote>

const fakeNote = {
  id: 1, user_id: 7, unit: null, exercise: null,
  content: '# Global notes', updated_at: new Date(),
}

function makeReq(overrides: Partial<Request> = {}): Request {
  return { user: { id: 7, username: 'dev', avatarUrl: '' }, params: {}, body: {}, ...overrides } as unknown as Request
}
function makeRes(): Response {
  return { json: jest.fn().mockReturnThis() } as unknown as Response
}
function makeNext(): NextFunction {
  return jest.fn()
}

beforeEach(() => jest.clearAllMocks())

describe('noteController.getAll', () => {
  it('returns { notes } from noteService', async () => {
    mockGetAll.mockResolvedValueOnce([fakeNote] as any)
    const res = makeRes()
    await noteController.getAll(makeReq(), res, makeNext())
    expect(res.json).toHaveBeenCalledWith({ notes: [fakeNote] })
  })
})

describe('noteController.getNote', () => {
  it('returns { note } for global (no params)', async () => {
    mockGetNote.mockResolvedValueOnce(fakeNote as any)
    const res = makeRes()
    await noteController.getNote(makeReq({ params: {} as any }), res, makeNext())
    expect(mockGetNote).toHaveBeenCalledWith(7, null, null)
    expect(res.json).toHaveBeenCalledWith({ note: fakeNote })
  })

  it('returns { note: null } when no note exists for the exercise', async () => {
    mockGetNote.mockResolvedValueOnce(null)
    const res = makeRes()
    await noteController.getNote(makeReq({ params: { unit: 'docker', exercise: '01-intro' } as any }), res, makeNext())
    expect(res.json).toHaveBeenCalledWith({ note: null })
  })
})

describe('noteController.upsertNote', () => {
  it('returns { note } after upserting a per-exercise note', async () => {
    const updated = { ...fakeNote, unit: 'docker', exercise: '01-intro', content: 'new' }
    mockUpsertNote.mockResolvedValueOnce(updated as any)
    const req = makeReq({ params: { unit: 'docker', exercise: '01-intro' } as any, body: { content: 'new' } })
    const res = makeRes()
    await noteController.upsertNote(req, res, makeNext())
    expect(mockUpsertNote).toHaveBeenCalledWith(7, 'docker', '01-intro', 'new')
    expect(res.json).toHaveBeenCalledWith({ note: updated })
  })

  it('calls next with BadRequestError when content is missing', async () => {
    const req = makeReq({ params: { unit: 'docker', exercise: '01-intro' } as any, body: {} })
    const next = makeNext()
    await noteController.upsertNote(req, makeRes(), next)
    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})
