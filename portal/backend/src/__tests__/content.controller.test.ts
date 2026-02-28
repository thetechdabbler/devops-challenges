jest.mock('../services/content.service', () => ({
  contentService: {
    getUnitsIndex: jest.fn(),
    getFileContent: jest.fn(),
  },
}))

import { Request, Response } from 'express'
import { contentController } from '../controllers/content.controller'
import { contentService } from '../services/content.service'
import { NotFoundError } from '../lib/errors'

const mockGetUnitsIndex = contentService.getUnitsIndex as jest.MockedFunction<typeof contentService.getUnitsIndex>
const mockGetFileContent = contentService.getFileContent as jest.MockedFunction<typeof contentService.getFileContent>

function makeRes() {
  return { json: jest.fn().mockReturnThis() } as unknown as Response
}

beforeEach(() => jest.clearAllMocks())

describe('contentController.listUnits', () => {
  it('returns { units } from contentService', () => {
    const units = [{ unit: 'docker', exercises: ['01-intro'] }]
    mockGetUnitsIndex.mockReturnValueOnce(units)
    const res = makeRes()
    contentController.listUnits({} as Request, res)
    expect(res.json).toHaveBeenCalledWith({ units })
  })
})

describe('contentController.getFile', () => {
  it('returns { content } for a valid file', () => {
    mockGetFileContent.mockReturnValueOnce('# Challenge')
    const req = { params: { unit: 'docker', exercise: '01-intro', file: 'challenge.md' } } as unknown as Request
    const res = makeRes()
    contentController.getFile(req, res)
    expect(mockGetFileContent).toHaveBeenCalledWith('docker', '01-intro', 'challenge.md')
    expect(res.json).toHaveBeenCalledWith({ content: '# Challenge' })
  })

  it('propagates NotFoundError thrown by contentService', () => {
    mockGetFileContent.mockImplementationOnce(() => { throw new NotFoundError('Unit not found: bad') })
    const req = { params: { unit: 'bad', exercise: '01-intro', file: 'README.md' } } as unknown as Request
    const res = makeRes()
    expect(() => contentController.getFile(req, res)).toThrow(NotFoundError)
  })
})
