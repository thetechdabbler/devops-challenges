jest.mock('../repositories/session.repository', () => ({
  sessionRepository: {
    findActive: jest.fn(),
    findActiveForExercise: jest.fn(),
    create: jest.fn(),
    end: jest.fn(),
    getTotalSeconds: jest.fn(),
  },
}))

import { sessionService } from '../services/session.service'
import { sessionRepository } from '../repositories/session.repository'

const mockFindActive = sessionRepository.findActive as jest.MockedFunction<typeof sessionRepository.findActive>
const mockFindActiveForExercise = sessionRepository.findActiveForExercise as jest.MockedFunction<typeof sessionRepository.findActiveForExercise>
const mockCreate = sessionRepository.create as jest.MockedFunction<typeof sessionRepository.create>
const mockEnd = sessionRepository.end as jest.MockedFunction<typeof sessionRepository.end>
const mockGetTotalSeconds = sessionRepository.getTotalSeconds as jest.MockedFunction<typeof sessionRepository.getTotalSeconds>

const startedAt = new Date('2026-01-01T10:00:00Z')
const activeSession = {
  id: 1, user_id: 7, unit: 'docker', exercise: '01-intro',
  started_at: startedAt, ended_at: null, duration_seconds: null, is_active: true,
}
const newSession = { ...activeSession, id: 2, unit: 'docker', exercise: '02-basics' }

beforeEach(() => jest.clearAllMocks())

describe('sessionService.start', () => {
  it('ends any existing active session before creating the new one', async () => {
    mockFindActive.mockResolvedValueOnce(activeSession)
    mockEnd.mockResolvedValueOnce({ ...activeSession, is_active: false } as any)
    mockCreate.mockResolvedValueOnce(newSession)

    const result = await sessionService.start(7, 'docker', '02-basics')

    expect(mockEnd).toHaveBeenCalledWith(activeSession.id, activeSession.started_at)
    expect(mockCreate).toHaveBeenCalledWith(7, 'docker', '02-basics')
    expect(result).toEqual(newSession)
  })

  it('creates session immediately when no active session exists', async () => {
    mockFindActive.mockResolvedValueOnce(null)
    mockCreate.mockResolvedValueOnce(newSession)

    await sessionService.start(7, 'docker', '02-basics')

    expect(mockEnd).not.toHaveBeenCalled()
    expect(mockCreate).toHaveBeenCalledWith(7, 'docker', '02-basics')
  })
})

describe('sessionService.end', () => {
  it('ends the active session and returns it', async () => {
    const ended = { ...activeSession, is_active: false, ended_at: new Date(), duration_seconds: 120 }
    mockFindActive.mockResolvedValueOnce(activeSession)
    mockEnd.mockResolvedValueOnce(ended as any)

    const result = await sessionService.end(7)

    expect(mockEnd).toHaveBeenCalledWith(activeSession.id, activeSession.started_at)
    expect(result).toEqual(ended)
  })

  it('returns null when no active session exists', async () => {
    mockFindActive.mockResolvedValueOnce(null)

    const result = await sessionService.end(7)

    expect(mockEnd).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })
})

describe('sessionService.getTotals', () => {
  it('returns totalSeconds, isActive=true, and activeStartedAt when session is running', async () => {
    mockGetTotalSeconds.mockResolvedValueOnce(600)
    mockFindActiveForExercise.mockResolvedValueOnce(activeSession)

    const result = await sessionService.getTotals(7, 'docker', '01-intro')

    expect(result).toEqual({ totalSeconds: 600, isActive: true, activeStartedAt: startedAt })
  })

  it('returns isActive=false and null activeStartedAt when no session running', async () => {
    mockGetTotalSeconds.mockResolvedValueOnce(300)
    mockFindActiveForExercise.mockResolvedValueOnce(null)

    const result = await sessionService.getTotals(7, 'docker', '01-intro')

    expect(result).toEqual({ totalSeconds: 300, isActive: false, activeStartedAt: null })
  })
})
