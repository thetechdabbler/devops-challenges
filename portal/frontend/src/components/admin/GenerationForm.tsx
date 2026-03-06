import { FormEvent, useState } from 'react'
import { ExperienceLevel, InterviewTopic } from '../../api/interview.api'

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
  loading: boolean
  onSubmit: (payload: {
    topics: InterviewTopic[]
    difficulty: number
    experienceLevel: ExperienceLevel
    count: number
  }) => void
}

export default function GenerationForm({ loading, onSubmit }: Props) {
  const [topic, setTopic] = useState<InterviewTopic>('Docker')
  const [difficulty, setDifficulty] = useState(3)
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('mid')
  const [count, setCount] = useState(5)

  function submit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ topics: [topic], difficulty, experienceLevel, count })
  }

  return (
    <form onSubmit={submit} style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 12,
      padding: '0.95rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
    }}>
      <h3 style={{ margin: 0, color: '#f1f5f9' }}>Generate Questions</h3>
      <label style={{ color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        Topic
        <select value={topic} onChange={e => setTopic(e.target.value as InterviewTopic)}>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label style={{ color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        Difficulty
        <input type="number" min={1} max={5} value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} />
      </label>
      <label style={{ color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        Experience
        <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value as ExperienceLevel)}>
          <option value="junior">junior</option>
          <option value="mid">mid</option>
          <option value="senior">senior</option>
        </select>
      </label>
      <label style={{ color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        Count
        <input type="number" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} />
      </label>

      <button
        type="submit"
        disabled={loading}
        style={{
          border: 'none',
          borderRadius: 8,
          background: loading ? '#334155' : '#0284c7',
          color: '#f8fafc',
          padding: '0.5rem 0.85rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 700,
          alignSelf: 'flex-start',
        }}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </form>
  )
}
