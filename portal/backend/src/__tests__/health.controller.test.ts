import { Request, Response } from 'express'

// Mock prisma before importing controller
jest.mock('../lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}))

// Mock logger to suppress output in tests
jest.mock('../lib/logger', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

import { check } from '../controllers/health.controller'
import { prisma } from '../lib/prisma'

const mockQueryRaw = prisma.$queryRaw as jest.MockedFunction<typeof prisma.$queryRaw>

function makeResMock() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response
  return res
}

describe('health.controller.check', () => {
  it('returns 200 with status ok when DB is reachable', async () => {
    mockQueryRaw.mockResolvedValueOnce([{ '?column?': 1 }])
    const req = {} as Request
    const res = makeResMock()

    await check(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ status: 'ok', db: 'connected' })
  })

  it('returns 503 with degraded status when DB query fails', async () => {
    mockQueryRaw.mockRejectedValueOnce(new Error('Connection refused'))
    const req = {} as Request
    const res = makeResMock()

    await check(req, res)

    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.json).toHaveBeenCalledWith({ status: 'degraded', db: 'unreachable' })
  })
})
