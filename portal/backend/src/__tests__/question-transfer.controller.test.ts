jest.mock('../services/question-transfer.service', () => ({
  questionTransferService: {
    exportQuestionsCsv: jest.fn(),
    validateImport: jest.fn(),
  },
}))

import { Request, Response, NextFunction } from 'express'
import { questionTransferController } from '../controllers/question-transfer.controller'
import { questionTransferService } from '../services/question-transfer.service'
import { BadRequestError } from '../lib/errors'

const mockExport = questionTransferService.exportQuestionsCsv as jest.MockedFunction<
  typeof questionTransferService.exportQuestionsCsv
>
const mockValidate = questionTransferService.validateImport as jest.MockedFunction<
  typeof questionTransferService.validateImport
>

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    user: { id: 1, username: 'u', avatarUrl: '', role: 'user' },
    ...overrides,
  } as unknown as Request
}

function mockRes(): { res: Response; json: jest.Mock; setHeader: jest.Mock; status: jest.Mock; send: jest.Mock } {
  const json = jest.fn()
  const setHeader = jest.fn()
  const send = jest.fn()
  const status = jest.fn().mockReturnThis()
  const res = { json, setHeader, send, status } as unknown as Response
  return { res, json, setHeader, status, send }
}

const next = jest.fn() as jest.MockedFunction<NextFunction>

beforeEach(() => jest.clearAllMocks())

describe('questionTransferController.exportCsv', () => {
  it('returns csv attachment', async () => {
    mockExport.mockResolvedValueOnce('text,topics\nQ,Docker')
    const req = mockReq({ query: { topics: 'Docker,Kubernetes', difficulty: '2' } })
    const { res, send, setHeader, status } = mockRes()

    await questionTransferController.exportCsv(req, res, next)

    expect(status).toHaveBeenCalledWith(200)
    expect(setHeader).toHaveBeenCalledWith('Content-Type', expect.stringContaining('text/csv'))
    expect(send).toHaveBeenCalledWith('text,topics\nQ,Docker')
  })

  it('calls next on invalid query', async () => {
    const req = mockReq({ query: { difficulty: '9' } })
    const { res } = mockRes()

    await questionTransferController.exportCsv(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError))
  })
})

describe('questionTransferController.importCsv', () => {
  it('returns validation result', async () => {
    mockValidate.mockResolvedValueOnce({
      summary: {
        totalRows: 1,
        validRows: 1,
        invalidRows: 0,
        insertedRows: 0,
        duplicateRows: 0,
        mode: 'dry-run',
      },
      issues: [],
    })

    const req = mockReq({
      body: {
        mode: 'dry-run',
        csv: 'text,topics,type,difficulty,experience_level,answer,explanation,key_concepts,status\\nQ,Docker,theory,2,junior,A,E,k,active',
      },
    })
    const { res, json } = mockRes()

    await questionTransferController.importCsv(req, res, next)

    expect(json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }))
  })

  it('passes apply mode to service', async () => {
    mockValidate.mockResolvedValueOnce({
      summary: {
        totalRows: 1,
        validRows: 1,
        invalidRows: 0,
        insertedRows: 1,
        duplicateRows: 0,
        mode: 'apply',
      },
      issues: [],
    })

    const req = mockReq({
      body: {
        mode: 'apply',
        csv: 'text,topics,type,difficulty,experience_level,answer,explanation,key_concepts,status\\nQ,Docker,theory,2,junior,A,E,k,active',
      },
    })
    const { res } = mockRes()

    await questionTransferController.importCsv(req, res, next)
    expect(mockValidate).toHaveBeenCalledWith(expect.any(String), 'apply')
  })
})
