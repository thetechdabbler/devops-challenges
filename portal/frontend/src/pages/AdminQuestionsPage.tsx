import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchAdminReviewQueue,
  fetchAdminStats,
  generateAdminQuestions,
  reviewAdminQuestion,
  AdminQuestion,
  BankStats,
} from '../api/admin.api'
import { ApiError } from '../api/client'
import GenerationForm from '../components/admin/GenerationForm'
import QuestionBankStats from '../components/admin/QuestionBankStats'
import ReviewQueue from '../components/admin/ReviewQueue'
import { useAuthStore } from '../store/auth.store'

export default function AdminQuestionsPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  const [stats, setStats] = useState<BankStats | null>(null)
  const [items, setItems] = useState<AdminQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/units', { replace: true })
      return
    }

    setLoading(true)
    setError(null)
    Promise.all([fetchAdminStats(), fetchAdminReviewQueue('pending_review', undefined, 20)])
      .then(([statsResult, queueResult]) => {
        setStats(statsResult)
        setItems(queueResult.items)
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 403) {
          navigate('/units', { replace: true })
          return
        }
        setError('Failed to load admin data')
      })
      .finally(() => setLoading(false))
  }, [navigate, user])

  async function reload() {
    const [statsResult, queueResult] = await Promise.all([
      fetchAdminStats(),
      fetchAdminReviewQueue('pending_review', undefined, 20),
    ])
    setStats(statsResult)
    setItems(queueResult.items)
  }

  async function handleGenerate(payload: {
    topics: Array<'Docker' | 'Kubernetes' | 'CI/CD' | 'Ansible' | 'IaC/Terraform' | 'Observability' | 'AWS' | 'General'>
    difficulty: number
    experienceLevel: 'junior' | 'mid' | 'senior'
    count: number
  }) {
    setActionLoading(true)
    setNotice(null)
    setError(null)
    try {
      const result = await generateAdminQuestions(payload)
      await reload()
      setNotice(`Generation complete: saved ${result.saved} / requested ${result.requested}`)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Generation failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReview(id: string, action: 'approve' | 'reject') {
    setActionLoading(true)
    setError(null)
    try {
      await reviewAdminQuestion(id, action)
      await reload()
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Review action failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem', background: '#0f172a', minHeight: '100%' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h2 style={{ margin: 0, color: '#f1f5f9' }}>Admin Question Management</h2>
        {loading && <div style={{ color: '#94a3b8' }}>Loading admin data...</div>}
        {error && <div style={{ color: '#fda4af' }}>{error}</div>}
        {notice && <div style={{ color: '#86efac' }}>{notice}</div>}

        {!loading && stats && (
          <>
            <QuestionBankStats stats={stats} />
            <GenerationForm loading={actionLoading} onSubmit={(payload) => void handleGenerate(payload)} />
            <ReviewQueue items={items} loading={actionLoading} onAction={(id, action) => void handleReview(id, action)} />
          </>
        )}
      </div>
    </div>
  )
}
