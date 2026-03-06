import { FormEvent } from 'react'
import { ExperienceLevel, InterviewTopic, SessionConfig } from '../../api/interview.api'

const TOPICS: InterviewTopic[] = [
  'Docker',
  'Kubernetes',
  'CI/CD',
  'Ansible',
  'IaC/Terraform',
  'Observability',
  'AWS',
  'General',
]

type Props = {
  value: SessionConfig
  loading: boolean
  error: string | null
  onChange: (next: SessionConfig) => void
  onSubmit: () => void
}

export default function SessionSetupForm({ value, loading, error, onChange, onSubmit }: Props) {
  function toggleTopic(topic: InterviewTopic) {
    const topics = value.topics.includes(topic)
      ? value.topics.filter(t => t !== topic)
      : [...value.topics, topic]
    onChange({ ...value, topics })
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <section>
        <h3 style={{ margin: '0 0 0.6rem', color: '#e2e8f0' }}>Topics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
          {TOPICS.map(topic => (
            <label key={topic} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#cbd5e1',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '0.5rem 0.65rem',
            }}>
              <input
                type="checkbox"
                checked={value.topics.includes(topic)}
                onChange={() => toggleTopic(topic)}
              />
              {topic}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 style={{ margin: '0 0 0.6rem', color: '#e2e8f0' }}>Difficulty: {value.difficulty}</h3>
        <input
          type="range"
          min={1}
          max={5}
          value={value.difficulty}
          onChange={e => onChange({ ...value, difficulty: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </section>

      <section>
        <h3 style={{ margin: '0 0 0.6rem', color: '#e2e8f0' }}>Experience Level</h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {(['junior', 'mid', 'senior'] as ExperienceLevel[]).map(level => (
            <label key={level} style={{ color: '#cbd5e1', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input
                type="radio"
                name="experience"
                checked={value.experienceLevel === level}
                onChange={() => onChange({ ...value, experienceLevel: level })}
              />
              {level}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 style={{ margin: '0 0 0.6rem', color: '#e2e8f0' }}>Question Count</h3>
        <input
          type="number"
          min={5}
          max={20}
          value={value.questionCount}
          onChange={e => onChange({ ...value, questionCount: Number(e.target.value) })}
          style={{
            width: 120,
            padding: '0.45rem',
            borderRadius: 6,
            border: '1px solid #475569',
            background: '#0f172a',
            color: '#e2e8f0',
          }}
        />
      </section>

      {error && (
        <div style={{ color: '#fda4af', background: '#3f1d2e', border: '1px solid #7f1d1d', padding: '0.6rem', borderRadius: 8 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          alignSelf: 'flex-start',
          background: loading ? '#334155' : '#0284c7',
          color: '#f8fafc',
          border: 'none',
          borderRadius: 8,
          padding: '0.65rem 1rem',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Starting Interview...' : 'Start Interview'}
      </button>
    </form>
  )
}
