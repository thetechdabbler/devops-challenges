import { Prisma, QuestionStatus, Topic, ExperienceLevel } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { Question, QuestionSummary, GeneratedQuestion, SaveMode, BankStats } from '../lib/question-bank/types'
import { QuestionExportFilters, QuestionTransferRow } from '../lib/question-transfer/types'
import {
  ReviewerQuestionCreateInput,
  ReviewerQuestionConflict,
  ReviewerQuestionCursor,
  ReviewerQuestionListFilters,
  ReviewerQuestionUpdateInput,
} from '../lib/reviewer-question/types'

// Raw query result shape (columns selected for QuestionSummary)
type RawQuestionRow = {
  id: string
  text: string
  type: string
  difficulty: number
  experience_level: string
  source: string
  status: string
  created_at: Date
}

function toQuestionSummary(row: RawQuestionRow, topics: Topic[]): QuestionSummary {
  return {
    id: row.id,
    text: row.text,
    type: row.type as QuestionSummary['type'],
    topics,
    difficulty: row.difficulty,
    experienceLevel: row.experience_level as ExperienceLevel,
    source: row.source as QuestionSummary['source'],
    status: row.status as QuestionStatus,
    createdAt: row.created_at,
  }
}

function toQuestionModel(q: {
  id: string
  text: string
  type: Question['type']
  topics: Array<{ topic: Topic }>
  difficulty: number
  experience_level: ExperienceLevel
  source: Question['source']
  status: QuestionStatus
  created_at: Date
  answer: string
  explanation: string
  key_concepts: string[]
}): Question {
  return {
    id: q.id,
    text: q.text,
    type: q.type,
    topics: q.topics.map(t => t.topic),
    difficulty: q.difficulty,
    experienceLevel: q.experience_level,
    source: q.source,
    status: q.status,
    createdAt: q.created_at,
    answer: q.answer,
    explanation: q.explanation,
    keyConcepts: q.key_concepts,
  }
}

type ReviewerUpdateResult =
  | { kind: 'updated'; question: Question }
  | { kind: 'conflict'; latest: Question; conflict: ReviewerQuestionConflict }
  | { kind: 'not_found' }

type ReviewerArchiveResult =
  | { kind: 'archived'; question: Question; idempotent: boolean }
  | { kind: 'not_found' }

export const questionRepository = {
  async createReviewerQuestion(input: ReviewerQuestionCreateInput, actorId: number): Promise<Question> {
    const created = await prisma.$transaction(async tx => {
      const question = await tx.question.create({
        data: {
          text: input.text,
          type: input.type,
          difficulty: input.difficulty,
          experience_level: input.experienceLevel,
          source: 'bank',
          status: input.status,
          answer: input.answer,
          explanation: input.explanation,
          key_concepts: input.keyConcepts,
          topics: {
            create: input.topics.map(topic => ({ topic })),
          },
        },
        include: { topics: { select: { topic: true } } },
      })

      await tx.questionAuditEvent.create({
        data: {
          question_id: question.id,
          actor_id: actorId,
          action: 'create',
          before_json: Prisma.JsonNull,
          after_json: question as unknown as Prisma.InputJsonValue,
        },
      })

      return question
    })

    return toQuestionModel(created)
  },

  async findForReviewerList(
    filters: ReviewerQuestionListFilters,
    cursor?: ReviewerQuestionCursor,
    limit = 20
  ): Promise<{ questions: Question[]; nextCursor: ReviewerQuestionCursor | null; hasMore: boolean }> {
    const take = Math.min(Math.max(limit, 1), 100) + 1

    const where: Prisma.QuestionWhereInput = {
      ...(filters.type ? { type: filters.type } : {}),
      ...(typeof filters.difficulty === 'number' ? { difficulty: filters.difficulty } : {}),
      ...(filters.experienceLevel ? { experience_level: filters.experienceLevel } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.topics && filters.topics.length > 0
        ? { topics: { some: { topic: { in: filters.topics } } } }
        : {}),
      ...(cursor
        ? {
            OR: [
              { created_at: { lt: cursor.createdAt } },
              {
                AND: [
                  { created_at: cursor.createdAt },
                  { id: { lt: cursor.id } },
                ],
              },
            ],
          }
        : {}),
    }

    const rows = await prisma.question.findMany({
      where,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take,
      include: { topics: { select: { topic: true } } },
    })

    const hasMore = rows.length === take
    const items = hasMore ? rows.slice(0, -1) : rows
    const last = items[items.length - 1]
    const nextCursor = hasMore && last
      ? { createdAt: last.created_at, id: last.id }
      : null

    const questions: Question[] = items.map(toQuestionModel)

    return { questions, nextCursor, hasMore }
  },

  async updateReviewerQuestion(
    id: string,
    revisionToken: number,
    patch: ReviewerQuestionUpdateInput,
    actorId: number
  ): Promise<ReviewerUpdateResult> {
    const existing = await prisma.question.findUnique({
      where: { id },
      include: { topics: { select: { topic: true } } },
    })
    if (!existing) return { kind: 'not_found' }

    if (existing.version !== revisionToken) {
      return {
        kind: 'conflict',
        latest: toQuestionModel(existing),
        conflict: { expectedVersion: revisionToken, actualVersion: existing.version },
      }
    }

    const updated = await prisma.$transaction(async tx => {
      const updatedCount = await tx.question.updateMany({
        where: { id, version: revisionToken },
        data: {
          ...(patch.text !== undefined ? { text: patch.text } : {}),
          ...(patch.answer !== undefined ? { answer: patch.answer } : {}),
          ...(patch.explanation !== undefined ? { explanation: patch.explanation } : {}),
          ...(patch.keyConcepts !== undefined ? { key_concepts: patch.keyConcepts } : {}),
          ...(patch.type !== undefined ? { type: patch.type } : {}),
          ...(patch.difficulty !== undefined ? { difficulty: patch.difficulty } : {}),
          ...(patch.experienceLevel !== undefined ? { experience_level: patch.experienceLevel } : {}),
          ...(patch.status !== undefined ? { status: patch.status } : {}),
          version: { increment: 1 },
        },
      })
      if (updatedCount.count === 0) return null

      if (patch.topics) {
        await tx.questionTopic.deleteMany({ where: { question_id: id } })
        await tx.questionTopic.createMany({
          data: patch.topics.map(topic => ({ question_id: id, topic })),
        })
      }

      const latest = await tx.question.findUnique({
        where: { id },
        include: { topics: { select: { topic: true } } },
      })
      if (!latest) return null

      await tx.questionAuditEvent.create({
        data: {
          question_id: id,
          actor_id: actorId,
          action: 'update',
          before_json: existing as unknown as Prisma.InputJsonValue,
          after_json: latest as unknown as Prisma.InputJsonValue,
        },
      })

      return latest
    })

    if (!updated) {
      const latest = await prisma.question.findUnique({
        where: { id },
        include: { topics: { select: { topic: true } } },
      })
      if (!latest) return { kind: 'not_found' }
      return {
        kind: 'conflict',
        latest: toQuestionModel(latest),
        conflict: { expectedVersion: revisionToken, actualVersion: latest.version },
      }
    }

    return { kind: 'updated', question: toQuestionModel(updated) }
  },

  async archiveReviewerQuestion(id: string, actorId: number): Promise<ReviewerArchiveResult> {
    const existing = await prisma.question.findUnique({
      where: { id },
      include: { topics: { select: { topic: true } } },
    })
    if (!existing) return { kind: 'not_found' }

    if (existing.status === QuestionStatus.rejected) {
      return { kind: 'archived', question: toQuestionModel(existing), idempotent: true }
    }

    const archived = await prisma.$transaction(async tx => {
      const updatedCount = await tx.question.updateMany({
        where: { id, status: { not: QuestionStatus.rejected } },
        data: { status: QuestionStatus.rejected, version: { increment: 1 } },
      })
      if (updatedCount.count === 0) return null

      const latest = await tx.question.findUnique({
        where: { id },
        include: { topics: { select: { topic: true } } },
      })
      if (!latest) return null

      await tx.questionAuditEvent.create({
        data: {
          question_id: id,
          actor_id: actorId,
          action: 'archive',
          before_json: existing as unknown as Prisma.InputJsonValue,
          after_json: latest as unknown as Prisma.InputJsonValue,
        },
      })

      return latest
    })

    if (!archived) {
      const latest = await prisma.question.findUnique({
        where: { id },
        include: { topics: { select: { topic: true } } },
      })
      if (!latest) return { kind: 'not_found' }
      return { kind: 'archived', question: toQuestionModel(latest), idempotent: true }
    }

    return { kind: 'archived', question: toQuestionModel(archived), idempotent: false }
  },

  async listQuestionAuditEvents(questionId: string, limit = 100) {
    const safeLimit = Math.max(1, Math.min(limit, 200))
    const rows = await prisma.questionAuditEvent.findMany({
      where: { question_id: questionId },
      orderBy: { created_at: 'desc' },
      take: safeLimit,
    })

    return rows.map(row => ({
      id: row.id,
      questionId: row.question_id,
      actorId: row.actor_id,
      action: row.action,
      beforeJson: row.before_json,
      afterJson: row.after_json,
      createdAt: row.created_at,
    }))
  },

  async existsForTransferImport(row: QuestionTransferRow): Promise<boolean> {
    const normalizedText = row.text.trim().replace(/\s+/g, ' ').toLowerCase()
    const topicArray = Prisma.raw(
      `ARRAY[${row.topics.map(t => `'${t}'`).join(',')}]::"Topic"[]`
    )

    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM "Question" q
        WHERE lower(btrim(regexp_replace(q.text, '\\s+', ' ', 'g'))) = ${normalizedText}
          AND q.type = ${row.type}::"QuestionType"
          AND q.difficulty = ${row.difficulty}
          AND q.experience_level = ${row.experienceLevel}::"ExperienceLevel"
          AND (SELECT COUNT(*) FROM "QuestionTopic" qt WHERE qt.question_id = q.id) = ${row.topics.length}
          AND NOT EXISTS (
            SELECT 1
            FROM "QuestionTopic" qt
            WHERE qt.question_id = q.id
              AND qt.topic <> ALL(${topicArray})
          )
      ) AS exists
    `

    return result[0]?.exists ?? false
  },

  async findForTransferExport(filters: QuestionExportFilters): Promise<QuestionTransferRow[]> {
    const rows = await prisma.question.findMany({
      where: {
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
        ...(filters.experienceLevel ? { experience_level: filters.experienceLevel } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.topics && filters.topics.length > 0
          ? { topics: { some: { topic: { in: filters.topics } } } }
          : {}),
      },
      include: { topics: { select: { topic: true } } },
      orderBy: { created_at: 'desc' },
    })

    return rows.map(row => ({
      text: row.text,
      topics: row.topics.map(t => t.topic),
      type: row.type,
      difficulty: row.difficulty,
      experienceLevel: row.experience_level,
      answer: row.answer,
      explanation: row.explanation,
      keyConcepts: row.key_concepts,
      status: row.status,
    }))
  },

  /**
   * Finds questions matching the given topics/difficulty/experienceLevel.
   * Uses ANY-match semantics: a question is eligible if it belongs to ANY of the
   * requested topics. Returns QuestionSummary (no answer fields) — ADR-002.
   * DISTINCT prevents duplicates when a question matches multiple topics — ADR-001.
   */
  async findByConfig(
    topics: Topic[],
    difficulty: number,
    experienceLevel: ExperienceLevel,
    status: QuestionStatus = QuestionStatus.active
  ): Promise<QuestionSummary[]> {
    const rows = await prisma.$queryRaw<RawQuestionRow[]>`
      SELECT *
      FROM (
        SELECT DISTINCT q.id, q.text, q.type, q.difficulty,
               q.experience_level, q.source, q.status, q.created_at
        FROM "Question" q
        JOIN "QuestionTopic" qt ON qt.question_id = q.id
        WHERE qt.topic = ANY(${Prisma.raw(`ARRAY[${topics.map(t => `'${t}'`).join(',')}]::\"Topic\"[]`)})
          AND q.difficulty = ${difficulty}
          AND q.experience_level = ${experienceLevel}::"ExperienceLevel"
          AND q.status = ${status}::"QuestionStatus"
      ) dedup
      ORDER BY RANDOM()
    `

    if (rows.length === 0) return []

    // Fetch topics for all returned questions in one query
    const ids = rows.map(r => r.id)
    const topicRows = await prisma.questionTopic.findMany({
      where: { question_id: { in: ids } },
      select: { question_id: true, topic: true },
    })

    const topicsByQuestion = new Map<string, Topic[]>()
    for (const t of topicRows) {
      const arr = topicsByQuestion.get(t.question_id) ?? []
      arr.push(t.topic)
      topicsByQuestion.set(t.question_id, arr)
    }

    return rows.map(row => toQuestionSummary(row, topicsByQuestion.get(row.id) ?? []))
  },

  /**
   * Returns a full Question including answer/explanation/keyConcepts.
   * Used ONLY in the reveal flow — never in session delivery (ADR-002).
   */
  async findById(id: string): Promise<Question | null> {
    const q = await prisma.question.findUnique({
      where: { id },
      include: { topics: { select: { topic: true } } },
    })
    if (!q) return null

    return {
      id: q.id,
      text: q.text,
      type: q.type,
      topics: q.topics.map(t => t.topic),
      difficulty: q.difficulty,
      experienceLevel: q.experience_level,
      source: q.source,
      status: q.status,
      createdAt: q.created_at,
      answer: q.answer,
      explanation: q.explanation,
      keyConcepts: q.key_concepts,
    }
  },

  /**
   * Saves a batch of questions with their topic associations.
   * Each question must have at least one topic (ADR-001 invariant).
   * For explicit control, pass the full shape (used by admin/manual flows).
   */
  async saveBatch(
    questions: Array<{
      text: string
      type: Question['type']
      topics: Topic[]
      difficulty: number
      experienceLevel: ExperienceLevel
      source: Question['source']
      status: QuestionStatus
      answer: string
      explanation: string
      keyConcepts: string[]
    }>
  ): Promise<string[]> {
    const ids: string[] = []

    await prisma.$transaction(async tx => {
      for (const q of questions) {
        if (q.topics.length === 0) {
          throw new Error(`Question must have at least one topic: "${q.text.slice(0, 40)}..."`)
        }

        const created = await tx.question.create({
          data: {
            text: q.text,
            type: q.type,
            difficulty: q.difficulty,
            experience_level: q.experienceLevel,
            source: q.source,
            status: q.status,
            answer: q.answer,
            explanation: q.explanation,
            key_concepts: q.keyConcepts,
            topics: {
              create: q.topics.map(topic => ({ topic })),
            },
          },
        })

        ids.push(created.id)
      }
    })

    return ids
  },

  /**
   * Paginated listing by status — for admin review queue.
   * Cursor-based pagination using question id (created_at DESC order).
   */
  async findByStatus(
    status: QuestionStatus,
    cursor?: string,
    limit = 20
  ): Promise<{ questions: Question[]; nextCursor: string | null; hasMore: boolean }> {
    const take = limit + 1
    const where = cursor
      ? { status, created_at: { lt: (await prisma.question.findUnique({ where: { id: cursor }, select: { created_at: true } }))?.created_at } }
      : { status }

    const rows = await prisma.question.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take,
      include: { topics: { select: { topic: true } } },
    })

    const hasMore = rows.length === take
    const items = hasMore ? rows.slice(0, -1) : rows
    const nextCursor = hasMore ? items[items.length - 1].id : null

    const questions: Question[] = items.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      topics: q.topics.map(t => t.topic),
      difficulty: q.difficulty,
      experienceLevel: q.experience_level,
      source: q.source,
      status: q.status,
      createdAt: q.created_at,
      answer: q.answer,
      explanation: q.explanation,
      keyConcepts: q.key_concepts,
    }))

    return { questions, nextCursor, hasMore }
  },

  /**
   * Atomically updates question status and records reviewer + timestamp.
   * Optionally updates text (on approve with edit).
   */
  async updateReview(
    id: string,
    status: QuestionStatus,
    adminId: number,
    text?: string
  ): Promise<Question> {
    const q = await prisma.question.update({
      where: { id },
      data: {
        status,
        reviewed_at: new Date(),
        reviewed_by: adminId,
        ...(text !== undefined ? { text } : {}),
      },
      include: { topics: { select: { topic: true } } },
    })

    return {
      id: q.id,
      text: q.text,
      type: q.type,
      topics: q.topics.map(t => t.topic),
      difficulty: q.difficulty,
      experienceLevel: q.experience_level,
      source: q.source,
      status: q.status,
      createdAt: q.created_at,
      answer: q.answer,
      explanation: q.explanation,
      keyConcepts: q.key_concepts,
    }
  },

  /**
   * Aggregated bank statistics — single query, no N+1.
   */
  async getStats(): Promise<BankStats> {
    type StatRow = { status: string; type: string; difficulty: number; topic: string; count: bigint }

    const rows = await prisma.$queryRaw<StatRow[]>`
      SELECT q.status, q.type, q.difficulty, qt.topic, COUNT(*) as count
      FROM "Question" q
      JOIN "QuestionTopic" qt ON qt.question_id = q.id
      GROUP BY q.status, q.type, q.difficulty, qt.topic
    `

    const byTopic: Record<string, number> = {}
    const byDifficulty: Record<number, number> = {}
    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}

    for (const row of rows) {
      const n = Number(row.count)
      byTopic[row.topic] = (byTopic[row.topic] ?? 0) + n
      byDifficulty[row.difficulty] = (byDifficulty[row.difficulty] ?? 0) + n
      byType[row.type] = (byType[row.type] ?? 0) + n
      byStatus[row.status] = (byStatus[row.status] ?? 0) + n
    }

    return {
      byTopic: byTopic as BankStats['byTopic'],
      byDifficulty,
      byType: byType as BankStats['byType'],
      byStatus: byStatus as BankStats['byStatus'],
      pendingReview: byStatus['pending_review'] ?? 0,
    }
  },

  /**
   * Saves AI-generated questions using SaveMode to determine status.
   * session → active (immediately usable in future sessions)
   * admin   → pending_review (quarantined until approved)
   */
  async saveGenerated(questions: GeneratedQuestion[], saveMode: SaveMode): Promise<string[]> {
    const status: QuestionStatus =
      saveMode === 'admin' ? QuestionStatus.pending_review : QuestionStatus.active

    return this.saveBatch(
      questions.map(q => ({
        text: q.text,
        type: q.type,
        topics: q.topics,
        difficulty: q.difficulty,
        experienceLevel: q.experienceLevel,
        source: 'ai',
        status,
        answer: q.answer,
        explanation: q.explanation,
        keyConcepts: q.keyConcepts,
      }))
    )
  },
}
