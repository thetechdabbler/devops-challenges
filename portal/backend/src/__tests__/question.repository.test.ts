import { QuestionStatus, Topic, ExperienceLevel } from '@prisma/client'

jest.mock('../lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    questionTopic: {
      findMany: jest.fn(),
    },
    question: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

import { questionRepository } from '../repositories/question.repository'
import { prisma } from '../lib/prisma'

const mockQueryRaw = prisma.$queryRaw as jest.MockedFunction<typeof prisma.$queryRaw>
const mockTopicFindMany = prisma.questionTopic.findMany as jest.MockedFunction<typeof prisma.questionTopic.findMany>
const mockQuestionFindUnique = prisma.question.findUnique as jest.MockedFunction<typeof prisma.question.findUnique>

const rawRow = {
  id: 'q-1',
  text: 'What is a Docker image?',
  type: 'theory',
  difficulty: 2,
  experience_level: 'junior',
  source: 'bank',
  status: 'active',
  created_at: new Date('2026-03-06'),
}

beforeEach(() => jest.clearAllMocks())

describe('questionRepository.findByConfig', () => {
  it('returns QuestionSummary array without answer fields', async () => {
    mockQueryRaw.mockResolvedValueOnce([rawRow])
    mockTopicFindMany.mockResolvedValueOnce([
      { question_id: 'q-1', topic: Topic.Docker },
    ] as any)

    const result = await questionRepository.findByConfig(
      [Topic.Docker],
      2,
      ExperienceLevel.junior
    )

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('q-1')
    expect(result[0].topics).toEqual([Topic.Docker])
    expect((result[0] as any).answer).toBeUndefined()
    expect((result[0] as any).explanation).toBeUndefined()
  })

  it('returns empty array when no questions match', async () => {
    mockQueryRaw.mockResolvedValueOnce([])
    const result = await questionRepository.findByConfig(
      [Topic.AWS],
      5,
      ExperienceLevel.senior
    )
    expect(result).toEqual([])
    expect(mockTopicFindMany).not.toHaveBeenCalled()
  })
})

describe('questionRepository.findById', () => {
  it('returns full Question including answer fields', async () => {
    mockQuestionFindUnique.mockResolvedValueOnce({
      id: 'q-1',
      text: 'What is a Docker image?',
      type: 'theory',
      difficulty: 2,
      experience_level: 'junior',
      source: 'bank',
      status: 'active',
      answer: 'A read-only template.',
      explanation: 'Docker images are built from layers...',
      key_concepts: ['layers', 'Dockerfile'],
      created_at: new Date('2026-03-06'),
      topics: [{ topic: Topic.Docker }],
    } as any)

    const result = await questionRepository.findById('q-1')

    expect(result).not.toBeNull()
    expect(result!.answer).toBe('A read-only template.')
    expect(result!.keyConcepts).toEqual(['layers', 'Dockerfile'])
    expect(result!.topics).toEqual([Topic.Docker])
  })

  it('returns null when question not found', async () => {
    mockQuestionFindUnique.mockResolvedValueOnce(null)
    const result = await questionRepository.findById('does-not-exist')
    expect(result).toBeNull()
  })
})
