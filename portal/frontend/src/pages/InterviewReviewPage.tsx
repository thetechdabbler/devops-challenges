import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { fetchInterviewSessionDetail, SessionReviewDetail } from '../api/interview.api'
import SessionReview from '../components/interview/SessionReview'

export default function InterviewReviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionReviewDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    setError(null)
    fetchInterviewSessionDetail(sessionId)
      .then(setSession)
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
          setError('Session not available')
          return
        }
        setError('Failed to load session review')
      })
      .finally(() => setLoading(false))
  }, [sessionId])

  return (
    <div style={{ padding: '1.5rem', background: '#0f172a', minHeight: '100%' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <button
          onClick={() => navigate('/interview/history')}
          style={{ alignSelf: 'flex-start', border: '1px solid #475569', borderRadius: 8, background: '#1e293b', color: '#e2e8f0', padding: '0.35rem 0.6rem', cursor: 'pointer' }}
        >
          Back to History
        </button>

        {loading && <div style={{ color: '#94a3b8' }}>Loading review...</div>}
        {error && <div style={{ color: '#fda4af' }}>{error}</div>}
        {session && <SessionReview session={session} />}
      </div>
    </div>
  )
}
