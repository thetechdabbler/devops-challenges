import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { fetchInterviewHistory, SessionHistoryItem } from '../api/interview.api'
import SessionHistoryCard from '../components/interview/SessionHistoryCard'

export default function InterviewHistoryPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<SessionHistoryItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load(cursor?: string, append = false) {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchInterviewHistory(cursor, 10)
      setItems(prev => append ? [...prev, ...result.items] : result.items)
      setNextCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Failed to load session history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div style={{ padding: '1.5rem', background: '#0f172a', minHeight: '100%' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h2 style={{ margin: 0, color: '#f1f5f9' }}>Interview History</h2>

        {loading && items.length === 0 && <div style={{ color: '#94a3b8' }}>Loading history...</div>}
        {error && <div style={{ color: '#fda4af' }}>{error}</div>}

        {!loading && items.length === 0 && !error && (
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: '1rem',
            color: '#cbd5e1',
          }}>
            No sessions yet.
            <button
              onClick={() => navigate('/interview/new')}
              style={{ marginLeft: 12, border: 'none', borderRadius: 8, background: '#0284c7', color: '#f8fafc', padding: '0.45rem 0.75rem', cursor: 'pointer' }}
            >
              Start your first interview
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
          {items.map(item => (
            <SessionHistoryCard
              key={item.id}
              item={item}
              onOpen={() => navigate(`/interview/history/${item.id}`)}
            />
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => void load(nextCursor ?? undefined, true)}
            disabled={loading}
            style={{
              alignSelf: 'flex-start',
              border: '1px solid #475569',
              borderRadius: 8,
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '0.45rem 0.75rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  )
}
