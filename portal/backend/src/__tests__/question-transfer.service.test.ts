jest.mock('../repositories/question.repository', () => ({
  questionRepository: {
    findForTransferExport: jest.fn(),
    existsForTransferImport: jest.fn(),
    saveBatch: jest.fn(),
  },
}))

import { Topic, QuestionType, ExperienceLevel, QuestionStatus } from '@prisma/client'
import { questionRepository } from '../repositories/question.repository'
import { questionTransferService } from '../services/question-transfer.service'
import { BadRequestError } from '../lib/errors'

const mockFindForExport = questionRepository.findForTransferExport as jest.MockedFunction<
  typeof questionRepository.findForTransferExport
>
const mockExistsForImport = questionRepository.existsForTransferImport as jest.MockedFunction<
  typeof questionRepository.existsForTransferImport
>
const mockSaveBatch = questionRepository.saveBatch as jest.MockedFunction<
  typeof questionRepository.saveBatch
>

describe('questionTransferService.exportQuestionsCsv', () => {
  beforeEach(() => jest.clearAllMocks())

  it('serializes export rows as CSV', async () => {
    mockFindForExport.mockResolvedValueOnce([
      {
        text: 'Explain Docker image layers',
        topics: [Topic.Docker, Topic.Kubernetes],
        type: QuestionType.theory,
        difficulty: 3,
        experienceLevel: ExperienceLevel.mid,
        answer: 'Use copy-on-write layers.',
        explanation: 'Each Dockerfile instruction creates a layer.',
        keyConcepts: ['layers', 'cache'],
        status: QuestionStatus.active,
      },
    ])

    const csv = await questionTransferService.exportQuestionsCsv({ status: QuestionStatus.active })

    expect(csv).toContain('text,topics,type,difficulty,experience_level,answer,explanation,key_concepts,status')
    expect(csv).toContain('Explain Docker image layers')
    expect(csv).toContain('Docker|Kubernetes')
  })
})

describe('questionTransferService.validateImport', () => {
  beforeEach(() => {
    mockExistsForImport.mockResolvedValue(false)
    mockSaveBatch.mockResolvedValue(['q-1'])
  })

  it('returns validation errors for invalid rows', async () => {
    const csv = [
      'text,topics,type,difficulty,experience_level,answer,explanation,key_concepts,status',
      'Valid question,Docker|Kubernetes,theory,3,mid,Ans,Expl,key1|key2,active',
      'Bad row,,oops,8,staff,,,x,rejected',
    ].join('\n')

    const result = await questionTransferService.validateImport(csv, 'dry-run')

    expect(result.summary.totalRows).toBe(2)
    expect(result.summary.validRows).toBe(1)
    expect(result.summary.invalidRows).toBe(1)
    expect(result.summary.insertedRows).toBe(0)
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('supports apply mode and inserts valid non-duplicate rows', async () => {
    const csv = 'text,topics,type,difficulty,experience_level,answer,explanation,key_concepts,status\nQ,Docker,theory,2,junior,A,E,k,active'

    const result = await questionTransferService.validateImport(csv, 'apply')
    expect(result.summary.insertedRows).toBe(1)
    expect(result.summary.duplicateRows).toBe(0)
    expect(mockSaveBatch).toHaveBeenCalled()
  })

  it('counts duplicate rows from file and bank in apply mode', async () => {
    mockExistsForImport.mockResolvedValueOnce(true)
    mockSaveBatch.mockResolvedValue([])
    const csv = [
      'text,topics,type,difficulty,experience_level,answer,explanation,key_concepts,status',
      'Q one,Docker,theory,2,junior,A,E,k,active',
      'Q one,Docker,theory,2,junior,A,E,k,active',
    ].join('\n')

    const result = await questionTransferService.validateImport(csv, 'apply')
    expect(result.summary.duplicateRows).toBe(2)
    expect(result.summary.insertedRows).toBe(0)
  })

  it('rejects invalid mode', async () => {
    const csv = 'text,topics,type,difficulty,experience_level,answer,explanation,key_concepts,status\nQ,Docker,theory,2,junior,A,E,k,active'
    await expect(
      questionTransferService.validateImport(csv, 'wrong' as unknown as 'dry-run' | 'apply')
    ).rejects.toBeInstanceOf(BadRequestError)
  })
})
