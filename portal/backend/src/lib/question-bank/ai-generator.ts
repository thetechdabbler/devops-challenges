import OpenAI from 'openai'
import { log } from '../logger'
import {
  GenerationConfig,
  GenerationResult,
  GeneratedQuestion,
  Topic,
  QuestionType,
  ExperienceLevel,
} from './types'

function getClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const VALID_TOPICS = new Set<string>([
  'Docker', 'Kubernetes', 'CI/CD', 'Ansible', 'IaC/Terraform',
  'Observability', 'AWS', 'General',
])

const VALID_TYPES = new Set<string>(['theory', 'scenario'])
const VALID_LEVELS = new Set<string>(['junior', 'mid', 'senior'])

// JSON Schema for OpenAI structured output (ADR-003)
const QUESTION_SCHEMA = {
  name: 'question_list',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text:             { type: 'string' },
            type:             { type: 'string', enum: ['theory', 'scenario'] },
            topics:           { type: 'array', items: { type: 'string' } },
            difficulty:       { type: 'integer', minimum: 1, maximum: 5 },
            experience_level: { type: 'string', enum: ['junior', 'mid', 'senior'] },
            answer:           { type: 'string' },
            explanation:      { type: 'string' },
            key_concepts:     { type: 'array', items: { type: 'string' } },
          },
          required: ['text', 'type', 'topics', 'difficulty', 'experience_level',
                     'answer', 'explanation', 'key_concepts'],
          additionalProperties: false,
        },
      },
    },
    required: ['questions'],
    additionalProperties: false,
  },
}

function buildPrompt(config: GenerationConfig): { system: string; user: string } {
  const topicList = config.topics.join(', ')
  const mix = config.type
    ? `All questions MUST be of type "${config.type}". Do not generate any other type.`
    : config.count === 1
      ? 'Generate 1 question of either type.'
      : `Aim for roughly 60% theory and 40% scenario questions.`

  const system = [
    'You are an expert DevOps interview question creator.',
    'Generate rigorous, realistic interview questions that test practical knowledge.',
    'Each question must have a clear, correct answer with an explanation suitable for self-study.',
    'Output ONLY the JSON object — no prose, no markdown.',
  ].join(' ')

  const user = [
    `Generate exactly ${config.count} DevOps interview question(s) with the following constraints:`,
    `- Topics: ${topicList}`,
    `- Difficulty: ${config.difficulty} out of 5`,
    `- Experience level: ${config.experienceLevel}`,
    mix,
    'Each question must cover real-world DevOps scenarios and tooling.',
    'Write comprehensive, interview-caliber responses in markdown.',
    'For "answer": provide a direct answer with enough depth to teach the concept (typically 120-220 words).',
    'For "explanation": provide a deeper walkthrough with reasoning, trade-offs, and common pitfalls (typically 150-280 words).',
    'Include concrete examples. When tooling/commands/config are relevant, include fenced markdown code blocks with language tags (for example: bash, yaml, dockerfile, hcl, json, sql).',
    'Scenario questions should include at least one practical implementation snippet or command sequence.',
    'Key concepts should be 3-6 terms relevant to the question.',
  ].join('\n')

  return { system, user }
}

function parseAndValidate(raw: unknown, config: GenerationConfig): GeneratedQuestion[] {
  if (
    typeof raw !== 'object' || raw === null ||
    !Array.isArray((raw as Record<string, unknown>).questions)
  ) {
    throw new Error('OpenAI response missing questions array')
  }

  const items = (raw as { questions: unknown[] }).questions
  const result: GeneratedQuestion[] = []

  for (const item of items) {
    if (typeof item !== 'object' || item === null) continue
    const q = item as Record<string, unknown>

    const text = typeof q.text === 'string' ? q.text.trim() : ''
    if (!text) continue

    const type = VALID_TYPES.has(q.type as string) ? (q.type as QuestionType) : 'theory'
    const experienceLevel = VALID_LEVELS.has(q.experience_level as string)
      ? (q.experience_level as ExperienceLevel)
      : config.experienceLevel

    const rawTopics = Array.isArray(q.topics) ? q.topics : []
    const topics = (rawTopics as string[])
      .filter(t => VALID_TOPICS.has(t))
      .map(t => t as Topic)
    // Fall back to the requested topics if OpenAI returned invalid ones
    const finalTopics = topics.length > 0 ? topics : config.topics

    const difficulty = typeof q.difficulty === 'number'
      ? Math.min(5, Math.max(1, Math.round(q.difficulty)))
      : config.difficulty

    result.push({
      text,
      type,
      topics: finalTopics,
      difficulty,
      experienceLevel,
      answer: typeof q.answer === 'string' ? q.answer : '',
      explanation: typeof q.explanation === 'string' ? q.explanation : '',
      keyConcepts: Array.isArray(q.key_concepts)
        ? (q.key_concepts as unknown[]).filter((k): k is string => typeof k === 'string')
        : [],
    })
  }

  return result
}

export const aiQuestionGenerator = {
  /**
   * Generates interview questions via OpenAI structured output (ADR-003).
   * Throws on API failure — caller is responsible for graceful degradation (ADR-004).
   */
  async generate(config: GenerationConfig): Promise<GenerationResult> {
    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
    const { system, user } = buildPrompt(config)

    log.info({ model, topics: config.topics, difficulty: config.difficulty,
               experienceLevel: config.experienceLevel, count: config.count },
      'Generating questions via OpenAI')

    const response = await getClient().chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: QUESTION_SCHEMA,
      },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('OpenAI returned empty content')
    }

    const parsed = JSON.parse(content) as unknown
    const questions = parseAndValidate(parsed, config)

    log.info({ requested: config.count, received: questions.length }, 'OpenAI generation complete')

    return { questions, requestedCount: config.count }
  },
}
