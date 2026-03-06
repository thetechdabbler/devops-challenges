import { NextFunction, Request, Response } from 'express'
import { ExperienceLevel, QuestionStatus, Topic } from '@prisma/client'

jest.mock('../services/reviewer-question.service')

import { reviewerQuestionController } from '../controllers/reviewer-question.controller'
import { reviewerQuestionService } from '../services/reviewer-question.service'
import { BadRequestError } from '../lib/errors'

const mockCreate = reviewerQuestionService.createQuestion as jest.MockedFunction<typeof reviewerQuestionService.createQuestion>
const mockList = reviewerQuestionService.listQuestions as jest.MockedFunction<typeof reviewerQuestionService.listQuestions>

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    user: { id: 1, username: 'reviewer', avatarUrl: '', role: 'reviewer' },
    ...overrides,
  } as unknown as Request
}

function mockRes(): { res: Response; json: jest.Mock; status: jest.Mock } {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  const res = { json, status } as unknown as Response
  return { res, json, status }
}

const next = jest.fn() as unknown as NextFunction

beforeEach(() => jest.clearAllMocks())

describe('reviewerQuestionController.create', () => {
  it('creates a question', async () => {
    const created = {
      id: 'q-1',
      text: 'What is Docker?',
      type: 'theory' as const,
      topics: [Topic.Docker],
      difficulty: 2,
      experienceLevel: ExperienceLevel.junior,
      source: 'bank' as const,
      status: QuestionStatus.active,
      createdAt: new Date('2026-03-06T00:00:00Z'),
      answer: 'A',
      explanation: 'E',
      keyConcepts: [],
    }
    mockCreate.mockResolvedValueOnce(created)
    const req = mockReq({
      body: {
        text: created.text,
        answer: created.answer,
        explanation: created.explanation,
        key_concepts: [],
        type: 'theory',
        topics: ['Docker'],
        difficulty: 2,
        experience_level: 'junior',
        status: 'active',
      },
    })
    const { res, status, json } = mockRes()

    await reviewerQuestionController.create(req, res, next)

    expect(status).toHaveBeenCalledWith(201)
    expect(mockCreate).toHaveBeenCalledWith(expect.any(Object), 1)
    expect(json).toHaveBeenCalledWith({ status: 'success', data: created })
  })

  it('validates required topics', async () => {
    const req = mockReq({
      body: {
        text: 'x',
        answer: 'y',
        explanation: 'z',
        type: 'theory',
        topics: [],
        difficulty: 2,
        experience_level: 'junior',
        status: 'active',
      },
    })
    const { res } = mockRes()

    await reviewerQuestionController.create(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})

describe('reviewerQuestionController.update', () => {
  it('returns conflict payload on stale update', async () => {
    mockCreate.mockReset()
    ;(reviewerQuestionService.updateQuestion as jest.Mock).mockResolvedValueOnce({
      kind: 'conflict',
      latest: {
        id: 'q-1',
        text: 'new',
        type: 'theory',
        topics: [Topic.Docker],
        difficulty: 2,
        experienceLevel: ExperienceLevel.junior,
        source: 'bank',
        status: QuestionStatus.active,
        createdAt: new Date('2026-03-06T00:00:00Z'),
        answer: 'A',
        explanation: 'E',
        keyConcepts: [],
      },
      conflict: { expectedVersion: 1, actualVersion: 2 },
    })

    const req = mockReq({
      params: { id: 'q-1' },
      body: { revision_token: 1, text: 'updated text' },
    })
    const { res } = mockRes()
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    ;(res as any).status = status

    await reviewerQuestionController.update(req, res, next)

    expect(status).toHaveBeenCalledWith(409)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.objectContaining({ code: 'CONFLICT' }) }))
  })

  it('validates revision token', async () => {
    const req = mockReq({
      params: { id: 'q-1' },
      body: { revision_token: -1, text: 'x' },
    })
    const { res } = mockRes()
    await reviewerQuestionController.update(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})

describe('reviewerQuestionController.archive', () => {
  it('archives with idempotent flag', async () => {
    ;(reviewerQuestionService.archiveQuestion as jest.Mock).mockResolvedValueOnce({
      kind: 'archived',
      question: {
        id: 'q-1',
        text: 'x',
        type: 'theory',
        topics: [Topic.Docker],
        difficulty: 2,
        experienceLevel: ExperienceLevel.junior,
        source: 'bank',
        status: QuestionStatus.rejected,
        createdAt: new Date('2026-03-06T00:00:00Z'),
        answer: 'A',
        explanation: 'E',
        keyConcepts: [],
      },
      idempotent: false,
    })
    const req = mockReq({ params: { id: 'q-1' } })
    const { res, json } = mockRes()
    await reviewerQuestionController.archive(req, res, next)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }))
  })
})

describe('reviewerQuestionController.list', () => {
  it('lists questions with encoded cursor', async () => {
    const nextCursor = { createdAt: new Date('2026-03-06T00:00:00Z'), id: 'q-2' }
    mockList.mockResolvedValueOnce({ items: [], nextCursor, hasMore: true })
    const req = mockReq({ query: { topics: 'Docker,AWS', limit: '10', status: 'active' } })
    const { res, json } = mockRes()

    await reviewerQuestionController.list(req, res, next)

    expect(mockList).toHaveBeenCalledWith(
      { topics: [Topic.Docker, Topic.AWS], type: undefined, difficulty: undefined, experienceLevel: undefined, status: QuestionStatus.active },
      undefined,
      10
    )
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }))
  })

  it('rejects invalid cursor', async () => {
    const req = mockReq({ query: { cursor: 'bad-cursor' } })
    const { res } = mockRes()

    await reviewerQuestionController.list(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})
