jest.mock('../lib/prisma', () => ({
  prisma: {
    exerciseProgress: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  },
}))

import { progressRepository } from '../repositories/progress.repository'
import { prisma } from '../lib/prisma'

const mockFindMany = prisma.exerciseProgress.findMany as jest.MockedFunction<typeof prisma.exerciseProgress.findMany>
const mockUpsert = prisma.exerciseProgress.upsert as jest.MockedFunction<typeof prisma.exerciseProgress.upsert>

const fakeProgress = {
  id: 1,
  user_id: 7,
  unit: 'docker',
  exercise: '01-intro',
  status: 'NotStarted' as const,
  updated_at: new Date(),
}

beforeEach(() => jest.clearAllMocks())

describe('progressRepository.findAll', () => {
  it('returns all progress records for a user', async () => {
    mockFindMany.mockResolvedValueOnce([fakeProgress])
    const result = await progressRepository.findAll(7)
    expect(mockFindMany).toHaveBeenCalledWith({ where: { user_id: 7 } })
    expect(result).toEqual([fakeProgress])
  })
})

describe('progressRepository.upsertStatus', () => {
  it('creates a new progress record when none exists', async () => {
    mockUpsert.mockResolvedValueOnce({ ...fakeProgress, status: 'InProgress' })
    const result = await progressRepository.upsertStatus(7, 'docker', '01-intro', 'InProgress')
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { user_id_unit_exercise: { user_id: 7, unit: 'docker', exercise: '01-intro' } },
      create: { user_id: 7, unit: 'docker', exercise: '01-intro', status: 'InProgress' },
      update: { status: 'InProgress' },
    })
    expect(result.status).toBe('InProgress')
  })

  it('updates an existing record to Completed', async () => {
    mockUpsert.mockResolvedValueOnce({ ...fakeProgress, status: 'Completed' })
    const result = await progressRepository.upsertStatus(7, 'docker', '01-intro', 'Completed')
    expect(result.status).toBe('Completed')
  })
})
