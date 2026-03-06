import { request } from './client'

export type InterviewTopic =
  | 'Docker'
  | 'Kubernetes'
  | 'CI/CD'
  | 'Ansible'
  | 'IaC/Terraform'
  | 'Observability'
  | 'AWS'
  | 'General'

export type ExperienceLevel = 'junior' | 'mid' | 'senior'
export type QuestionType = 'theory' | 'scenario'

export type QuestionSummary = {
  id: string
  text: string
  type: QuestionType
  topics: InterviewTopic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  source: 'bank' | 'ai'
  status: 'pending_review' | 'active' | 'rejected'
  createdAt: string
}

export type SessionConfig = {
  topics: InterviewTopic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  questionCount: number
}

export type CreateSessionResponse = {
  sessionId: string
  status: 'in_progress'
  questionCount: number
  gapCount?: number
  currentQuestion: {
    sequenceOrder: number
    totalCount: number
    question: QuestionSummary | null
  }
}

export type CurrentQuestionResponse = {
  sessionStatus: 'in_progress' | 'completed'
  sequenceOrder: number | null
  totalCount: number
  question: QuestionSummary | null
}

export type RevealResponse = {
  questionId: string
  answer: string
  explanation: string
  keyConcepts: string[]
  sessionStatus: 'in_progress' | 'completed'
}

export type SessionHistoryItem = {
  id: string
  createdAt: string
  topics: InterviewTopic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  questionCount: number
  status: 'in_progress' | 'completed'
  avgSelfRating: number | null
}

export type SessionHistoryResult = {
  items: SessionHistoryItem[]
  nextCursor: string | null
  hasMore: boolean
}

export type SessionReviewDetail = {
  id: string
  createdAt: string
  topics: InterviewTopic[]
  difficulty: number
  experienceLevel: ExperienceLevel
  questionCount: number
  status: 'in_progress' | 'completed'
  completedAt: string | null
  questions: Array<{
    questionId: string
    sequenceOrder: number
    answerRevealed: boolean
    selfRating: number | null
    question: {
      id: string
      text: string
      type: QuestionType
      topics: InterviewTopic[]
      answer: string
      explanation: string
      keyConcepts: string[]
    }
  }>
}

export async function createInterviewSession(config: SessionConfig): Promise<CreateSessionResponse> {
  const response = await request<{
    status: string
    data: {
      session_id: string
      status: 'in_progress'
      question_count: number
      gap_count?: number
      current_question: {
        sequence_order: number
        total_count: number
        question: QuestionSummary | null
      }
    }
  }>('/api/v1/sessions', {
    method: 'POST',
    body: JSON.stringify({
      topics: config.topics,
      difficulty: config.difficulty,
      experience_level: config.experienceLevel,
      question_count: config.questionCount,
    }),
  })

  return {
    sessionId: response.data.session_id,
    status: response.data.status,
    questionCount: response.data.question_count,
    gapCount: response.data.gap_count,
    currentQuestion: {
      sequenceOrder: response.data.current_question.sequence_order,
      totalCount: response.data.current_question.total_count,
      question: response.data.current_question.question,
    },
  }
}

export async function fetchCurrentInterviewQuestion(sessionId: string): Promise<CurrentQuestionResponse> {
  const response = await request<{
    status: string
    data: {
      session_status: 'in_progress' | 'completed'
      sequence_order: number | null
      total_count: number
      question: QuestionSummary | null
    }
  }>(`/api/v1/sessions/${sessionId}/questions/current`)

  return {
    sessionStatus: response.data.session_status,
    sequenceOrder: response.data.sequence_order,
    totalCount: response.data.total_count,
    question: response.data.question,
  }
}

export async function revealInterviewAnswer(
  sessionId: string,
  questionId: string
): Promise<RevealResponse> {
  const response = await request<{
    status: string
    data: {
      question_id: string
      answer: string
      explanation: string
      key_concepts: string[]
      session_status: 'in_progress' | 'completed'
    }
  }>(`/api/v1/sessions/${sessionId}/questions/${questionId}/reveal`, { method: 'POST', body: JSON.stringify({}) })

  return {
    questionId: response.data.question_id,
    answer: response.data.answer,
    explanation: response.data.explanation,
    keyConcepts: response.data.key_concepts,
    sessionStatus: response.data.session_status,
  }
}

export async function submitInterviewRating(
  sessionId: string,
  questionId: string,
  rating: number
): Promise<void> {
  await request<{
    status: string
    data: { session_id: string; question_id: string; self_rating: number }
  }>(`/api/v1/sessions/${sessionId}/questions/${questionId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  })
}

export async function fetchInterviewHistory(cursor?: string, limit = 10): Promise<SessionHistoryResult> {
  const query = new URLSearchParams()
  query.set('limit', String(limit))
  if (cursor) query.set('cursor', cursor)

  const response = await request<{
    status: string
    data: {
      items: Array<{
        id: string
        created_at: string
        topics: InterviewTopic[]
        difficulty: number
        experience_level: ExperienceLevel
        question_count: number
        status: 'in_progress' | 'completed'
        avg_self_rating: number | null
      }>
      nextCursor: string | null
      hasMore: boolean
    }
  }>(`/api/v1/sessions?${query.toString()}`)

  return {
    items: response.data.items.map(item => ({
      id: item.id,
      createdAt: item.created_at,
      topics: item.topics,
      difficulty: item.difficulty,
      experienceLevel: item.experience_level,
      questionCount: item.question_count,
      status: item.status,
      avgSelfRating: item.avg_self_rating,
    })),
    nextCursor: response.data.nextCursor,
    hasMore: response.data.hasMore,
  }
}

export async function fetchInterviewSessionDetail(sessionId: string): Promise<SessionReviewDetail> {
  const response = await request<{
    status: string
    data: {
      id: string
      created_at: string
      topics: InterviewTopic[]
      difficulty: number
      experience_level: ExperienceLevel
      question_count: number
      status: 'in_progress' | 'completed'
      completed_at: string | null
      questions: Array<{
        question_id: string
        sequence_order: number
        answer_revealed: boolean
        self_rating: number | null
        question: {
          id: string
          text: string
          type: QuestionType
          topics: InterviewTopic[]
          answer: string
          explanation: string
          key_concepts: string[]
        }
      }>
    }
  }>(`/api/v1/sessions/${sessionId}`)

  return {
    id: response.data.id,
    createdAt: response.data.created_at,
    topics: response.data.topics,
    difficulty: response.data.difficulty,
    experienceLevel: response.data.experience_level,
    questionCount: response.data.question_count,
    status: response.data.status,
    completedAt: response.data.completed_at,
    questions: response.data.questions.map(q => ({
      questionId: q.question_id,
      sequenceOrder: q.sequence_order,
      answerRevealed: q.answer_revealed,
      selfRating: q.self_rating,
      question: {
        id: q.question.id,
        text: q.question.text,
        type: q.question.type,
        topics: q.question.topics,
        answer: q.question.answer,
        explanation: q.question.explanation,
        keyConcepts: q.question.key_concepts,
      },
    })),
  }
}
