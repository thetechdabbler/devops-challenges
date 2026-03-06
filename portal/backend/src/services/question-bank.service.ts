import { questionRepository } from '../repositories/question.repository'
import { userQuestionHistoryRepository } from '../repositories/user-question-history.repository'
import { filterUnseen } from '../lib/question-bank/dedup'
import { aiQuestionGenerator } from '../lib/question-bank/ai-generator'
import { enforceMix } from '../lib/question-bank/mix'
import { SessionConfig, QuestionFetchResult } from '../lib/question-bank/types'
import { log } from '../lib/logger'

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const questionBankService = {
  /**
   * Full hybrid flow (ADR-004):
   * 1. Fetch from bank matching config
   * 2. Filter out questions seen in the last 30 days
   * 3. Shuffle and take up to config.count
   * 4. If gap > 0: generate via OpenAI, save as active, merge
   * 5. Record all served questions as seen
   *
   * AI failures are non-fatal — returns bank-only results with gapCount > 0.
   * Callers MUST handle gapCount > 0 as a valid state (ADR-004).
   */
  async getQuestionsForSession(
    config: SessionConfig,
    userId: number
  ): Promise<QuestionFetchResult> {
    // Step 1 & 2: bank lookup + dedup
    const candidates = await questionRepository.findByConfig(
      config.topics,
      config.difficulty,
      config.experienceLevel
    )
    const unseen = await filterUnseen(userId, candidates)
    const taken = shuffle(unseen).slice(0, config.count)
    let gapCount = Math.max(0, config.count - taken.length)

    const allQuestions = [...taken]

    // Step 4: AI gap-fill for count shortfall
    if (gapCount > 0) {
      try {
        const result = await aiQuestionGenerator.generate({ ...config, count: gapCount })
        if (result.questions.length > 0) {
          const savedIds = await questionRepository.saveGenerated(result.questions, 'session')
          // Re-fetch saved questions as QuestionSummary to maintain ADR-002 contract
          const savedSummaries = await Promise.all(
            savedIds.map(id => questionRepository.findById(id))
          )
          const validSaved = savedSummaries.filter(Boolean).map(q => ({
            id: q!.id,
            text: q!.text,
            type: q!.type,
            topics: q!.topics,
            difficulty: q!.difficulty,
            experienceLevel: q!.experienceLevel,
            source: q!.source,
            status: q!.status,
            createdAt: q!.createdAt,
          }))
          allQuestions.push(...validSaved)
          gapCount = Math.max(0, config.count - allQuestions.length)
        }
      } catch (err) {
        // Non-fatal: log and continue with bank-only results (ADR-004)
        log.warn({ err, gapCount, config }, 'AI question generation failed — returning bank-only results')
      }
    }

    // Step 4b: Type-targeted AI gap-fill for mix constraint (ADR-008)
    const { theoryGap, scenarioGap } = enforceMix(allQuestions, config.count)
    for (const [type, gap] of [['theory', theoryGap], ['scenario', scenarioGap]] as const) {
      if (gap === 0) continue
      try {
        const result = await aiQuestionGenerator.generate({ ...config, count: gap, type })
        if (result.questions.length > 0) {
          const savedIds = await questionRepository.saveGenerated(result.questions, 'session')
          const savedSummaries = await Promise.all(savedIds.map(id => questionRepository.findById(id)))
          const validSaved = savedSummaries.filter(Boolean).map(q => ({
            id: q!.id, text: q!.text, type: q!.type, topics: q!.topics,
            difficulty: q!.difficulty, experienceLevel: q!.experienceLevel,
            source: q!.source, status: q!.status, createdAt: q!.createdAt,
          }))
          allQuestions.push(...validSaved)
        }
      } catch (err) {
        // Non-fatal: log and continue (ADR-004, ADR-008)
        log.warn({ err, type, gap, config }, `AI ${type} gap-fill failed — mix constraint may not be satisfied`)
      }
    }
    // Recompute gapCount after mix gap-fill
    gapCount = Math.max(0, config.count - allQuestions.length)

    // Step 5: record all served questions as seen
    if (allQuestions.length > 0) {
      await userQuestionHistoryRepository.recordSeen(userId, allQuestions.map(q => q.id))
    }

    return { questions: allQuestions, gapCount }
  },

  /**
   * Records that a user has been assigned a set of questions.
   * Call this when questions are committed to a session (if not using getQuestionsForSession).
   */
  async recordQuestionsAssigned(userId: number, questionIds: string[]): Promise<void> {
    await userQuestionHistoryRepository.recordSeen(userId, questionIds)
  },
}
