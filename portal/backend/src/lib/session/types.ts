import { ExperienceLevel, Topic } from '@prisma/client'
import { QuestionSummary } from '../question-bank/types'

export type InterviewSessionConfig = {
  topics: Topic[]
  difficulty: number        // 1-5
  experienceLevel: ExperienceLevel
  questionCount: number     // 5-20
}

export type CurrentQuestionResult = {
  sessionStatus: 'in_progress' | 'completed'
  sequenceOrder: number | null
  totalCount: number
  question: QuestionSummary | null
}

export type CreateSessionResult = {
  sessionId: string
  status: 'in_progress'
  questionCount: number
  gapCount: number
  currentQuestion: CurrentQuestionResult
}

export type RevealResult = {
  questionId: string
  answer: string
  explanation: string
  keyConcepts: string[]
  sessionStatus: 'in_progress' | 'completed'
}

export type SubmitRatingResult = {
  sessionId: string
  questionId: string
  selfRating: number
}

export type SessionHistoryCursor = {
  createdAt: Date
  id: string
}

export type SessionHistoryItem = {
  id: string
  createdAt: Date
  topics: Topic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  questionCount: number
  status: 'in_progress' | 'completed'
  avgSelfRating: number | null
}

export type SessionHistoryResult = {
  items: SessionHistoryItem[]
  nextCursor: SessionHistoryCursor | null
  hasMore: boolean
}

export type SessionReviewQuestion = {
  questionId: string
  sequenceOrder: number
  answerRevealed: boolean
  selfRating: number | null
  question: {
    id: string
    text: string
    type: 'theory' | 'scenario'
    topics: Topic[]
    answer: string
    explanation: string
    keyConcepts: string[]
  }
}

export type SessionDetailResult = {
  id: string
  createdAt: Date
  topics: Topic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  questionCount: number
  status: 'in_progress' | 'completed'
  completedAt: Date | null
  questions: SessionReviewQuestion[]
}
