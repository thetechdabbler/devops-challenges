import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CurrentQuestionResponse,
  fetchCurrentInterviewQuestion,
  revealInterviewAnswer,
  RevealResponse,
  submitInterviewRating,
} from '../api/interview.api'
import { ApiError } from '../api/client'
import AnswerReveal from '../components/interview/AnswerReveal'
import QuestionCard from '../components/interview/QuestionCard'
import SelfRating from '../components/interview/SelfRating'

export default function InterviewSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [loadingQuestion, setLoadingQuestion] = useState(true)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [questionData, setQuestionData] = useState<CurrentQuestionResponse | null>(null)

  const [revealLoading, setRevealLoading] = useState(false)
  const [revealError, setRevealError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<RevealResponse | null>(null)

  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const loadCurrentQuestion = useCallback(async () => {
    if (!sessionId) return
    setLoadingQuestion(true)
    setQuestionError(null)
    try {
      const current = await fetchCurrentInterviewQuestion(sessionId)
      setQuestionData(current)
      setRevealed(null)
      setSelectedRating(null)
      setRevealError(null)
      setRatingError(null)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setQuestionError('Session not found')
      } else {
        setQuestionError('Could not load current question')
      }
    } finally {
      setLoadingQuestion(false)
    }
  }, [sessionId])

  useEffect(() => {
    void loadCurrentQuestion()
  }, [loadCurrentQuestion])

  async function handleReveal() {
    if (!sessionId || !questionData?.question) return
    setRevealLoading(true)
    setRevealError(null)
    try {
      const response = await revealInterviewAnswer(sessionId, questionData.question.id)
      setRevealed(response)
    } catch (err) {
      if (err instanceof ApiError) {
        setRevealError(err.message)
      } else {
        setRevealError('Failed to reveal answer')
      }
    } finally {
      setRevealLoading(false)
    }
  }

  async function handleRate(rating: number) {
    if (!sessionId || !questionData?.question) return
    setRatingLoading(true)
    setRatingError(null)
    try {
      await submitInterviewRating(sessionId, questionData.question.id, rating)
      setSelectedRating(rating)
    } catch (err) {
      if (err instanceof ApiError) {
        setRatingError(err.message)
      } else {
        setRatingError('Failed to submit rating')
      }
    } finally {
      setRatingLoading(false)
    }
  }

  async function handleNext() {
    await loadCurrentQuestion()
  }

  if (!sessionId) return null

  if (loadingQuestion) {
    return (
      <div style={{ padding: '1.5rem', background: '#0f172a', minHeight: '100%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', color: '#94a3b8' }}>Loading question...</div>
      </div>
    )
  }

  if (questionError) {
    return (
      <div style={{ padding: '1.5rem', background: '#0f172a', minHeight: '100%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', color: '#fda4af' }}>{questionError}</div>
      </div>
    )
  }

  if (!questionData || questionData.sessionStatus === 'completed' || !questionData.question) {
    return (
      <div style={{ padding: '1.5rem', background: '#0f172a', minHeight: '100%' }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: '1.2rem',
          color: '#e2e8f0',
        }}>
          <h2 style={{ margin: '0 0 0.8rem' }}>Session Completed</h2>
          <p style={{ margin: '0 0 1rem', color: '#94a3b8' }}>
            Nice work. You can continue practicing or review your session history in the next UI bolt.
          </p>
          <button
            onClick={() => navigate('/units')}
            style={{
              border: 'none',
              borderRadius: 8,
              background: '#0284c7',
              color: '#f8fafc',
              fontWeight: 700,
              padding: '0.55rem 0.9rem',
              cursor: 'pointer',
            }}
          >
            Back to Units
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', background: '#0f172a', minHeight: '100%' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <QuestionCard
          question={questionData.question}
          sequenceOrder={questionData.sequenceOrder ?? 1}
          totalCount={questionData.totalCount}
        />

        <AnswerReveal
          loading={revealLoading}
          error={revealError}
          revealed={revealed}
          onReveal={() => void handleReveal()}
        />

        {revealed && (
          <SelfRating
            loading={ratingLoading}
            selectedRating={selectedRating}
            error={ratingError}
            onRate={(rating) => void handleRate(rating)}
            onSkipNext={() => void handleNext()}
            onNext={() => void handleNext()}
          />
        )}
      </div>
    </div>
  )
}
