jest.mock('../lib/prisma', () => ({
  prisma: {
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}))

import { sessionRepository } from '../repositories/session.repository'
import { prisma } from '../lib/prisma'

const mockCreate = prisma.session.create as jest.MockedFunction<typeof prisma.session.create>
const mockFindFirst = prisma.session.findFirst as jest.MockedFunction<typeof prisma.session.findFirst>
const mockUpdate = prisma.session.update as jest.MockedFunction<typeof prisma.session.update>
const mockAggregate = prisma.session.aggregate as jest.MockedFunction<typeof prisma.session.aggregate>

const startedAt = new Date('2026-01-01T10:00:00Z')
const fakeSession = {
  id: 1,
  user_id: 7,
  unit: 'docker',
  exercise: '01-intro',
  started_at: startedAt,
  ended_at: null,
  duration_seconds: null,
  is_active: true,
}

beforeEach(() => jest.clearAllMocks())

describe('sessionRepository.create', () => {
  it('creates a new active session', async () => {
    mockCreate.mockResolvedValueOnce(fakeSession)
    const result = await sessionRepository.create(7, 'docker', '01-intro')
    expect(mockCreate).toHaveBeenCalledWith({
      data: { user_id: 7, unit: 'docker', exercise: '01-intro' },
    })
    expect(result.is_active).toBe(true)
  })
})

describe('sessionRepository.findActive', () => {
  it('returns the active session when one exists', async () => {
    mockFindFirst.mockResolvedValueOnce(fakeSession)
    const result = await sessionRepository.findActive(7)
    expect(mockFindFirst).toHaveBeenCalledWith({ where: { user_id: 7, is_active: true } })
    expect(result).toEqual(fakeSession)
  })

  it('returns null when no active session', async () => {
    mockFindFirst.mockResolvedValueOnce(null)
    const result = await sessionRepository.findActive(7)
    expect(result).toBeNull()
  })
})

describe('sessionRepository.end', () => {
  it('sets ended_at, duration_seconds, and is_active=false', async () => {
    const ended = { ...fakeSession, ended_at: new Date(), duration_seconds: 300, is_active: false }
    mockUpdate.mockResolvedValueOnce(ended)
    const result = await sessionRepository.end(1, startedAt)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ is_active: false }),
      })
    )
    expect(result.is_active).toBe(false)
  })
})

describe('sessionRepository.getTotalSeconds', () => {
  it('returns sum of duration_seconds for completed sessions', async () => {
    mockAggregate.mockResolvedValueOnce({ _sum: { duration_seconds: 1200 } } as any)
    const result = await sessionRepository.getTotalSeconds(7, 'docker', '01-intro')
    expect(result).toBe(1200)
  })

  it('returns 0 when no completed sessions exist', async () => {
    mockAggregate.mockResolvedValueOnce({ _sum: { duration_seconds: null } } as any)
    const result = await sessionRepository.getTotalSeconds(7, 'docker', '01-intro')
    expect(result).toBe(0)
  })
})
