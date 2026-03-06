import { Request, Response, NextFunction } from 'express'
import { QuestionStatus, Topic, ExperienceLevel } from '@prisma/client'

jest.mock('../services/admin-question.service')

import { adminQuestionController } from '../controllers/admin-question.controller'
import { adminQuestionService } from '../services/admin-question.service'
import { BadRequestError } from '../lib/errors'
import { Question } from '../lib/question-bank/types'

const mockBulkGenerate = adminQuestionService.bulkGenerate as jest.MockedFunction<typeof adminQuestionService.bulkGenerate>
const mockReview = adminQuestionService.reviewQuestion as jest.MockedFunction<typeof adminQuestionService.reviewQuestion>
const mockList = adminQuestionService.listByStatus as jest.MockedFunction<typeof adminQuestionService.listByStatus>
const mockStats = adminQuestionService.getStats as jest.MockedFunction<typeof adminQuestionService.getStats>

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    user: { id: 1, username: 'admin', avatarUrl: '', role: 'admin' },
    ...overrides,
  } as unknown as Request
}

function mockRes(): { res: Response; json: jest.Mock } {
  const json = jest.fn()
  const res = { json } as unknown as Response
  return { res, json }
}

const next = jest.fn() as unknown as NextFunction

function makeQuestion(): Question {
  return {
    id: 'q-1', text: 'Q', type: 'theory',
    topics: [Topic.Docker], difficulty: 2,
    experienceLevel: ExperienceLevel.junior,
    source: 'ai', status: QuestionStatus.pending_review,
    createdAt: new Date(),
    answer: 'A', explanation: 'E', keyConcepts: [],
  }
}

beforeEach(() => jest.clearAllMocks())

describe('adminQuestionController.generate', () => {
  it('returns success with generation result', async () => {
    mockBulkGenerate.mockResolvedValueOnce({ requested: 5, saved: 5, errors: 0 })
    const req = mockReq({ body: { topics: ['Docker'], difficulty: 2, experienceLevel: 'junior', count: 5 } })
    const { res, json } = mockRes()

    await adminQuestionController.generate(req, res, next)

    expect(json).toHaveBeenCalledWith({ status: 'success', data: { requested: 5, saved: 5, errors: 0 } })
  })

  it('calls next with BadRequestError on missing topics', async () => {
    const req = mockReq({ body: { topics: [], difficulty: 2, experienceLevel: 'junior', count: 5 } })
    const { res } = mockRes()

    await adminQuestionController.generate(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })

  it('calls next with BadRequestError on invalid difficulty', async () => {
    const req = mockReq({ body: { topics: ['Docker'], difficulty: 10, experienceLevel: 'junior', count: 5 } })
    const { res } = mockRes()

    await adminQuestionController.generate(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})

describe('adminQuestionController.review', () => {
  it('approves a question', async () => {
    mockReview.mockResolvedValueOnce({ ...makeQuestion(), status: QuestionStatus.active })
    const req = mockReq({ params: { id: 'q-1' }, body: { action: 'approve' } })
    const { res, json } = mockRes()

    await adminQuestionController.review(req, res, next)

    expect(mockReview).toHaveBeenCalledWith('q-1', 'approve', 1, undefined)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }))
  })

  it('calls next with BadRequestError on invalid action', async () => {
    const req = mockReq({ params: { id: 'q-1' }, body: { action: 'archive' } })
    const { res } = mockRes()

    await adminQuestionController.review(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})

describe('adminQuestionController.stats', () => {
  it('returns stats', async () => {
    const stats = {
      byTopic: { Docker: 5 }, byDifficulty: { 2: 5 },
      byType: { theory: 3, scenario: 2 },
      byStatus: { active: 4, pending_review: 1, rejected: 0 },
      pendingReview: 1,
    }
    mockStats.mockResolvedValueOnce(stats)
    const req = mockReq()
    const { res, json } = mockRes()

    await adminQuestionController.stats(req, res, next)

    expect(json).toHaveBeenCalledWith({ status: 'success', data: stats })
  })
})

describe('adminQuestionController.list', () => {
  it('lists pending_review questions', async () => {
    mockList.mockResolvedValueOnce({ items: [makeQuestion()], nextCursor: null, hasMore: false })
    const req = mockReq({ query: { status: 'pending_review' } })
    const { res, json } = mockRes()

    await adminQuestionController.list(req, res, next)

    expect(json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }))
  })
})
