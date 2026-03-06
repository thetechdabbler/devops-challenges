import { QuestionSummary } from '../../api/interview.api'

type Props = {
  question: QuestionSummary
  sequenceOrder: number
  totalCount: number
}

function titleCase(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export default function QuestionCard({ question, sequenceOrder, totalCount }: Props) {
  return (
    <section style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 12,
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>
          Question {sequenceOrder} of {totalCount}
        </div>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', border: '1px solid #475569', color: '#cbd5e1', borderRadius: 999, padding: '0.15rem 0.5rem' }}>
            {titleCase(question.type)}
          </span>
          {question.topics.slice(0, 2).map(topic => (
            <span key={topic} style={{ fontSize: '0.72rem', border: '1px solid #0ea5e9', color: '#7dd3fc', borderRadius: 999, padding: '0.15rem 0.5rem' }}>
              {topic}
            </span>
          ))}
        </div>
      </div>

      <p style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.5, fontSize: '1.03rem' }}>
        {question.text}
      </p>
    </section>
  )
}
