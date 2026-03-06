import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createInterviewSession,
  ExperienceLevel,
  InterviewTopic,
  SessionConfig,
} from '../api/interview.api'
import { ApiError } from '../api/client'
import SessionSetupForm from '../components/interview/SessionSetupForm'

const INITIAL_CONFIG: SessionConfig = {
  topics: [],
  difficulty: 3,
  experienceLevel: 'mid' as ExperienceLevel,
  questionCount: 10,
}

export default function InterviewSetupPage() {
  const [config, setConfig] = useState<SessionConfig>(INITIAL_CONFIG)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit() {
    if (config.topics.length === 0) {
      setError('Select at least one topic')
      return
    }
    if (config.questionCount < 5 || config.questionCount > 20) {
      setError('Question count must be between 5 and 20')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const result = await createInterviewSession({
        ...config,
        topics: config.topics as InterviewTopic[],
      })
      navigate(`/interview/${result.sessionId}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to start interview session')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem', background: '#0f172a', minHeight: '100%' }}>
      <div style={{
        maxWidth: 920,
        margin: '0 auto',
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '1.25rem',
      }}>
        <h2 style={{ margin: '0 0 1rem', color: '#f1f5f9' }}>Start DevOps Interview</h2>
        <p style={{ margin: '0 0 1.25rem', color: '#94a3b8' }}>
          Configure your session and begin a focused mock interview flow.
        </p>
        <SessionSetupForm
          value={config}
          loading={loading}
          error={error}
          onChange={setConfig}
          onSubmit={() => void handleSubmit()}
        />
      </div>
    </div>
  )
}
