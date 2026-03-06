import { AdminQuestion } from '../../api/admin.api'

type Props = {
  items: AdminQuestion[]
  loading: boolean
  onAction: (id: string, action: 'approve' | 'reject') => void
}

export default function ReviewQueue({ items, loading, onAction }: Props) {
  return (
    <section style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 12,
      padding: '0.95rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <h3 style={{ margin: 0, color: '#f1f5f9' }}>Pending Review</h3>

      {items.length === 0 && (
        <div style={{ color: '#94a3b8' }}>All caught up. No questions pending review.</div>
      )}

      {items.map(item => (
        <article key={item.id} style={{
          border: '1px solid #334155',
          borderRadius: 10,
          padding: '0.7rem',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}>
          <div style={{ color: '#e2e8f0', fontWeight: 700 }}>{item.text}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {item.type} • difficulty {item.difficulty} • {item.experienceLevel}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              disabled={loading}
              onClick={() => onAction(item.id, 'approve')}
              style={{
                border: 'none',
                borderRadius: 7,
                background: '#166534',
                color: '#f8fafc',
                padding: '0.35rem 0.65rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Approve
            </button>
            <button
              disabled={loading}
              onClick={() => onAction(item.id, 'reject')}
              style={{
                border: 'none',
                borderRadius: 7,
                background: '#b91c1c',
                color: '#f8fafc',
                padding: '0.35rem 0.65rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}
