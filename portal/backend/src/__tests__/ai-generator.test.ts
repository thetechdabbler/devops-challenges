import { Topic, ExperienceLevel } from '@prisma/client'
import { GenerationConfig } from '../lib/question-bank/types'

const mockCreate = jest.fn()

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  }))
})

import { aiQuestionGenerator } from '../lib/question-bank/ai-generator'

const config: GenerationConfig = {
  topics: [Topic.Docker],
  difficulty: 2,
  experienceLevel: ExperienceLevel.junior,
  count: 2,
}

const validResponse = {
  questions: [
    {
      text: 'What is the difference between CMD and ENTRYPOINT in a Dockerfile?',
      type: 'theory',
      topics: ['Docker'],
      difficulty: 2,
      experience_level: 'junior',
      answer: 'CMD provides defaults that can be overridden; ENTRYPOINT sets the fixed executable.',
      explanation: 'CMD arguments are replaced when docker run receives extra args.',
      key_concepts: ['CMD', 'ENTRYPOINT', 'Dockerfile', 'container startup'],
    },
    {
      text: 'How would you reduce the size of a Docker image?',
      type: 'scenario',
      topics: ['Docker'],
      difficulty: 2,
      experience_level: 'junior',
      answer: 'Use multi-stage builds and minimal base images like alpine.',
      explanation: 'Multi-stage builds discard intermediate layers.',
      key_concepts: ['multi-stage build', 'alpine', 'layer caching'],
    },
  ],
}

beforeEach(() => jest.clearAllMocks())

describe('aiQuestionGenerator.generate', () => {
  it('returns parsed questions on valid response', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(validResponse) } }],
    })

    const result = await aiQuestionGenerator.generate(config)

    expect(result.requestedCount).toBe(2)
    expect(result.questions).toHaveLength(2)
    expect(result.questions[0].text).toContain('CMD')
    expect(result.questions[0].topics).toEqual([Topic.Docker])
    expect(result.questions[1].type).toBe('scenario')
  })

  it('falls back to config topics when OpenAI returns invalid topic', async () => {
    const withBadTopic = {
      questions: [{ ...validResponse.questions[0], topics: ['InvalidTopic'] }],
    }
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(withBadTopic) } }],
    })

    const result = await aiQuestionGenerator.generate(config)
    expect(result.questions[0].topics).toEqual(config.topics)
  })

  it('clamps difficulty to 1–5 range', async () => {
    const withBadDifficulty = {
      questions: [{ ...validResponse.questions[0], difficulty: 99 }],
    }
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(withBadDifficulty) } }],
    })

    const result = await aiQuestionGenerator.generate(config)
    expect(result.questions[0].difficulty).toBe(5)
  })

  it('throws when OpenAI returns empty content', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
    })

    await expect(aiQuestionGenerator.generate(config)).rejects.toThrow('empty content')
  })

  it('throws when OpenAI API call fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('rate limit exceeded'))

    await expect(aiQuestionGenerator.generate(config)).rejects.toThrow('rate limit exceeded')
  })
})
