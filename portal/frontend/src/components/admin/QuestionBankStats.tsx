import { BankStats } from '../../api/admin.api'

type Props = {
  stats: BankStats
}

export default function QuestionBankStats({ stats }: Props) {
  return (
    <section style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 12,
      padding: '0.95rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
    }}>
      <h3 style={{ margin: 0, color: '#f1f5f9' }}>Question Bank Stats</h3>
      <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
        Pending review: {stats.pendingReview}
      </div>
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
        {Object.entries(stats.byTopic).map(([topic, count]) => (
          <span key={topic} style={{
            border: '1px solid #0ea5e9',
            borderRadius: 999,
            padding: '0.12rem 0.5rem',
            fontSize: '0.72rem',
            color: '#7dd3fc',
          }}>
            {topic}: {count}
          </span>
        ))}
      </div>
    </section>
  )
}
