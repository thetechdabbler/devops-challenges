import { ExperienceLevel, QuestionStatus, QuestionType, Topic } from '@prisma/client'

export type ReviewerQuestionCreateInput = {
  text: string
  answer: string
  explanation: string
  keyConcepts: string[]
  type: QuestionType
  topics: Topic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  status: QuestionStatus
}

export type ReviewerQuestionListFilters = {
  topics?: Topic[]
  type?: QuestionType
  difficulty?: number
  experienceLevel?: ExperienceLevel
  status?: QuestionStatus
}

export type ReviewerQuestionCursor = {
  createdAt: Date
  id: string
}

export type ReviewerQuestionUpdateInput = {
  text?: string
  answer?: string
  explanation?: string
  keyConcepts?: string[]
  type?: QuestionType
  topics?: Topic[]
  difficulty?: number
  experienceLevel?: ExperienceLevel
  status?: QuestionStatus
}

export type ReviewerQuestionConflict = {
  expectedVersion: number
  actualVersion: number
}

export type ReviewerQuestionAuditEvent = {
  id: string
  questionId: string
  actorId: number
  action: 'create' | 'update' | 'archive'
  beforeJson: unknown
  afterJson: unknown
  createdAt: Date
}
