import { SessionHistoryItem } from '../../api/interview.api'

type Props = {
  item: SessionHistoryItem
  onOpen: () => void
}

export default function SessionHistoryCard({ item, onOpen }: Props) {
  const dateLabel = new Date(item.createdAt).toLocaleString()
  const avgLabel = item.avgSelfRating === null ? 'Not rated' : `Avg: ${item.avgSelfRating.toFixed(1)}/5`

  return (
    <button
      onClick={onOpen}
      style={{
        border: '1px solid #334155',
        borderRadius: 12,
        background: '#1e293b',
        padding: '0.9rem',
        color: '#e2e8f0',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem' }}>
        <span style={{ color: '#93c5fd', fontWeight: 700 }}>{dateLabel}</span>
        <span style={{
          border: '1px solid #475569',
          borderRadius: 999,
          padding: '0.1rem 0.45rem',
          fontSize: '0.72rem',
          color: item.status === 'completed' ? '#86efac' : '#fde68a',
        }}>
          {item.status === 'completed' ? 'Completed' : 'In Progress'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {item.topics.map(topic => (
          <span key={topic} style={{
            border: '1px solid #0ea5e9',
            borderRadius: 999,
            padding: '0.08rem 0.45rem',
            fontSize: '0.72rem',
            color: '#7dd3fc',
          }}>
            {topic}
          </span>
        ))}
      </div>

      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
        Difficulty: {item.difficulty} • Experience: {item.experienceLevel} • Questions: {item.questionCount}
      </div>
      <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{avgLabel}</div>
    </button>
  )
}
