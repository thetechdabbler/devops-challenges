import { ExperienceLevel, InterviewSessionStatus, Topic } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { QuestionSummary } from '../lib/question-bank/types'
import { CurrentQuestionResult, SessionDetailResult, SessionHistoryCursor, SessionHistoryResult } from '../lib/session/types'

type SessionRow = {
  id: string
  userId: number
  questionCount: number
  status: InterviewSessionStatus
}

// Prisma select for the QuestionSummary shape (ADR-002 — never includes answer/explanation)
const QUESTION_SUMMARY_SELECT = {
  id: true,
  text: true,
  type: true,
  difficulty: true,
  experience_level: true,
  source: true,
  status: true,
  created_at: true,
  topics: { select: { topic: true } },
} as const

function mapToQuestionSummary(q: {
  id: string
  text: string
  type: string
  difficulty: number
  experience_level: string
  source: string
  status: string
  created_at: Date
  topics: { topic: Topic }[]
}): QuestionSummary {
  return {
    id: q.id,
    text: q.text,
    type: q.type as QuestionSummary['type'],
    topics: q.topics.map(t => t.topic),
    difficulty: q.difficulty,
    experienceLevel: q.experience_level as ExperienceLevel,
    source: q.source as QuestionSummary['source'],
    status: q.status as QuestionSummary['status'],
    createdAt: q.created_at,
  }
}

export const interviewSessionRepository = {
  /**
   * Atomically creates an InterviewSession + its InterviewSessionQuestions.
   * question_count is set to questionIds.length (actual, not requested — ADR-007).
   */
  async create(
    userId: number,
    config: { topics: Topic[]; difficulty: number; experienceLevel: ExperienceLevel },
    questionIds: string[]
  ): Promise<{ id: string; questionCount: number }> {
    return prisma.$transaction(async tx => {
      const session = await tx.interviewSession.create({
        data: {
          user_id: userId,
          topics: config.topics,
          difficulty: config.difficulty,
          experience_level: config.experienceLevel,
          question_count: questionIds.length,
          status: InterviewSessionStatus.in_progress,
        },
        select: { id: true, question_count: true },
      })

      if (questionIds.length > 0) {
        await tx.interviewSessionQuestion.createMany({
          data: questionIds.map((questionId, i) => ({
            session_id: session.id,
            question_id: questionId,
            sequence_order: i + 1,
          })),
        })
      }

      return { id: session.id, questionCount: session.question_count }
    })
  },

  /**
   * Finds a session by ID (no user scope — ownership checked by service layer).
   */
  async findById(id: string): Promise<SessionRow | null> {
    const session = await prisma.interviewSession.findUnique({
      where: { id },
      select: { id: true, user_id: true, question_count: true, status: true },
    })
    if (!session) return null
    return {
      id: session.id,
      userId: session.user_id,
      questionCount: session.question_count,
      status: session.status,
    }
  },

  /**
   * Atomically marks a question as revealed within a session.
   * Idempotent — safe to call multiple times (ADR-009).
   * Returns null if the question is not part of the session.
   */
  async revealQuestion(
    sessionId: string,
    questionId: string
  ): Promise<{ questionId: string; alreadyRevealed: boolean } | null> {
    const sq = await prisma.interviewSessionQuestion.findUnique({
      where: { session_id_question_id: { session_id: sessionId, question_id: questionId } },
      select: { answer_revealed: true },
    })
    if (!sq) return null

    if (!sq.answer_revealed) {
      await prisma.interviewSessionQuestion.update({
        where: { session_id_question_id: { session_id: sessionId, question_id: questionId } },
        data: { answer_revealed: true, revealed_at: new Date() },
      })
    }

    return { questionId, alreadyRevealed: sq.answer_revealed }
  },

  /**
   * Counts questions in the session that have not yet been revealed.
   */
  async countUnrevealed(sessionId: string): Promise<number> {
    return prisma.interviewSessionQuestion.count({
      where: { session_id: sessionId, answer_revealed: false },
    })
  },

  /**
   * Marks session as completed (ADR-009 — triggered when countUnrevealed == 0).
   * Idempotent — safe if already completed.
   */
  async completeSession(sessionId: string): Promise<void> {
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: InterviewSessionStatus.completed, completed_at: new Date() },
    })
  },

  /**
   * Finds a specific question assignment row within a session.
   * Returns null when the question does not belong to the session.
   */
  async findSessionQuestion(
    sessionId: string,
    questionId: string
  ): Promise<{ answerRevealed: boolean; selfRating: number | null } | null> {
    const row = await prisma.interviewSessionQuestion.findUnique({
      where: { session_id_question_id: { session_id: sessionId, question_id: questionId } },
      select: { answer_revealed: true, self_rating: true },
    })
    if (!row) return null
    return {
      answerRevealed: row.answer_revealed,
      selfRating: row.self_rating,
    }
  },

  /**
   * Updates self rating for a session question (last-write-wins).
   */
  async updateSelfRating(
    sessionId: string,
    questionId: string,
    rating: number
  ): Promise<{ questionId: string; selfRating: number }> {
    const updated = await prisma.interviewSessionQuestion.update({
      where: { session_id_question_id: { session_id: sessionId, question_id: questionId } },
      data: { self_rating: rating },
      select: { question_id: true, self_rating: true },
    })

    return {
      questionId: updated.question_id,
      selfRating: updated.self_rating ?? rating,
    }
  },

  /**
   * Lists sessions for a user using keyset pagination over created_at DESC, id DESC.
   */
  async listByUser(
    userId: number,
    limit: number,
    cursor?: SessionHistoryCursor
  ): Promise<SessionHistoryResult> {
    const take = limit + 1
    const sessions = await prisma.interviewSession.findMany({
      where: {
        user_id: userId,
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
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take,
      include: {
        session_questions: {
          select: { self_rating: true },
        },
      },
    })

    const hasMore = sessions.length > limit
    const page = hasMore ? sessions.slice(0, limit) : sessions

    const items = page.map(session => {
      const rated = session.session_questions
        .map(sq => sq.self_rating)
        .filter((v): v is number => v !== null)
      const avgSelfRating = rated.length > 0
        ? rated.reduce((sum, n) => sum + n, 0) / rated.length
        : null

      return {
        id: session.id,
        createdAt: session.created_at,
        topics: session.topics,
        difficulty: session.difficulty,
        experienceLevel: session.experience_level,
        questionCount: session.question_count,
        status: session.status,
        avgSelfRating,
      }
    })

    const next = hasMore ? page[page.length - 1] : null
    return {
      items,
      nextCursor: next ? { createdAt: next.created_at, id: next.id } : null,
      hasMore,
    }
  },

  /**
   * Returns full session detail with ordered questions for review mode.
   */
  async getSessionDetail(sessionId: string): Promise<SessionDetailResult | null> {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        session_questions: {
          orderBy: { sequence_order: 'asc' },
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                answer: true,
                explanation: true,
                key_concepts: true,
                topics: { select: { topic: true } },
              },
            },
          },
        },
      },
    })
    if (!session) return null

    return {
      id: session.id,
      createdAt: session.created_at,
      topics: session.topics,
      difficulty: session.difficulty,
      experienceLevel: session.experience_level,
      questionCount: session.question_count,
      status: session.status,
      completedAt: session.completed_at,
      questions: session.session_questions.map(sq => ({
        questionId: sq.question_id,
        sequenceOrder: sq.sequence_order,
        answerRevealed: sq.answer_revealed,
        selfRating: sq.self_rating,
        question: {
          id: sq.question.id,
          text: sq.question.text,
          type: sq.question.type,
          topics: sq.question.topics.map(t => t.topic),
          answer: sq.question.answer,
          explanation: sq.question.explanation,
          keyConcepts: sq.question.key_concepts,
        },
      })),
    }
  },

  /**
   * Returns the current question for a session.
   * "Current" = lowest sequence_order where answer_revealed = false.
   * Returns null if sessionId does not exist.
   * Does NOT enforce ownership — caller must check before invoking.
   */
  async findCurrentQuestion(sessionId: string): Promise<CurrentQuestionResult | null> {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      select: { question_count: true, status: true },
    })
    if (!session) return null

    if (session.status === InterviewSessionStatus.completed) {
      return {
        sessionStatus: 'completed',
        sequenceOrder: null,
        totalCount: session.question_count,
        question: null,
      }
    }

    const sq = await prisma.interviewSessionQuestion.findFirst({
      where: { session_id: sessionId, answer_revealed: false },
      orderBy: { sequence_order: 'asc' },
      select: {
        sequence_order: true,
        question: { select: QUESTION_SUMMARY_SELECT },
      },
    })

    if (!sq) {
      // All questions revealed — treat as completed (bolt 005 handles the status transition)
      return {
        sessionStatus: 'completed',
        sequenceOrder: null,
        totalCount: session.question_count,
        question: null,
      }
    }

    return {
      sessionStatus: 'in_progress',
      sequenceOrder: sq.sequence_order,
      totalCount: session.question_count,
      question: mapToQuestionSummary(sq.question),
    }
  },
}
