jest.mock('../services/progress.service', () => ({
  progressService: {
    getAll: jest.fn(),
    updateStatus: jest.fn(),
  },
}))
jest.mock('../services/session.service', () => ({
  sessionService: {
    start: jest.fn(),
    end: jest.fn(),
    getTotals: jest.fn(),
  },
}))

import { Request, Response, NextFunction } from 'express'
import { progressController } from '../controllers/progress.controller'
import { progressService } from '../services/progress.service'
import { sessionService } from '../services/session.service'
import { BadRequestError } from '../lib/errors'

const mockGetAll = progressService.getAll as jest.MockedFunction<typeof progressService.getAll>
const mockUpdateStatus = progressService.updateStatus as jest.MockedFunction<typeof progressService.updateStatus>
const mockStart = sessionService.start as jest.MockedFunction<typeof sessionService.start>
const mockEnd = sessionService.end as jest.MockedFunction<typeof sessionService.end>

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

describe('progressController.getAll', () => {
  it('returns { progress } from progressService', async () => {
    const progress = [{ id: 1, user_id: 7, unit: 'docker', exercise: '01-intro', status: 'NotStarted', updated_at: new Date() }]
    mockGetAll.mockResolvedValueOnce(progress as any)
    const res = makeRes()
    await progressController.getAll(makeReq(), res, makeNext())
    expect(res.json).toHaveBeenCalledWith({ progress })
  })
})

describe('progressController.updateStatus', () => {
  it('returns updated progress for a valid status', async () => {
    const updated = { id: 1, user_id: 7, unit: 'docker', exercise: '01-intro', status: 'InProgress', updated_at: new Date() }
    mockUpdateStatus.mockResolvedValueOnce(updated as any)
    const req = makeReq({ params: { unit: 'docker', exercise: '01-intro' } as any, body: { status: 'InProgress' } })
    const res = makeRes()
    await progressController.updateStatus(req, res, makeNext())
    expect(mockUpdateStatus).toHaveBeenCalledWith(7, 'docker', '01-intro', 'InProgress')
    expect(res.json).toHaveBeenCalledWith({ progress: updated })
  })

  it('calls next with BadRequestError for an invalid status', async () => {
    const req = makeReq({ params: { unit: 'docker', exercise: '01-intro' } as any, body: { status: 'Broken' } })
    const next = makeNext()
    await progressController.updateStatus(req, makeRes(), next)
    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})

describe('progressController.startSession', () => {
  it('returns { session } when unit and exercise are provided', async () => {
    const session = { id: 5, user_id: 7, unit: 'docker', exercise: '01-intro', started_at: new Date(), is_active: true }
    mockStart.mockResolvedValueOnce(session as any)
    const req = makeReq({ body: { unit: 'docker', exercise: '01-intro' } })
    const res = makeRes()
    await progressController.startSession(req, res, makeNext())
    expect(mockStart).toHaveBeenCalledWith(7, 'docker', '01-intro')
    expect(res.json).toHaveBeenCalledWith({ session })
  })

  it('calls next with BadRequestError when unit or exercise is missing', async () => {
    const req = makeReq({ body: { unit: 'docker' } })
    const next = makeNext()
    await progressController.startSession(req, makeRes(), next)
    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})

describe('progressController.endSession', () => {
  it('returns { session: null } when no active session exists', async () => {
    mockEnd.mockResolvedValueOnce(null)
    const res = makeRes()
    await progressController.endSession(makeReq(), res, makeNext())
    expect(res.json).toHaveBeenCalledWith({ session: null })
  })
})
