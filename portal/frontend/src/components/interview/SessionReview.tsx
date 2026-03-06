import { SessionReviewDetail } from '../../api/interview.api'
import InterviewMarkdown from './InterviewMarkdown'

type Props = {
  session: SessionReviewDetail
}

export default function SessionReview({ session }: Props) {
  const rated = session.questions.filter(q => q.selfRating !== null)
  const avg = rated.length > 0 ? rated.reduce((s, q) => s + (q.selfRating ?? 0), 0) / rated.length : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <section style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '0.95rem',
        color: '#e2e8f0',
      }}>
        <h2 style={{ margin: '0 0 0.5rem' }}>Session Review</h2>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Questions: {session.questionCount} • Status: {session.status} • Avg rating: {avg === null ? 'Not rated' : avg.toFixed(1)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
          {session.topics.map(topic => (
            <span key={topic} style={{ border: '1px solid #0ea5e9', borderRadius: 999, padding: '0.08rem 0.45rem', fontSize: '0.72rem', color: '#7dd3fc' }}>
              {topic}
            </span>
          ))}
        </div>
      </section>

      {session.questions.map(item => (
        <article key={item.questionId} style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: '0.95rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
        }}>
          <div style={{ color: '#93c5fd', fontWeight: 700 }}>
            Question {item.sequenceOrder} • {item.question.type}
          </div>
          <div style={{ color: '#e2e8f0' }}>{item.question.text}</div>
          <div style={{ color: '#86efac' }}>
            <strong>Answer:</strong>
            <InterviewMarkdown content={item.question.answer} color="#86efac" />
          </div>
          <div style={{ color: '#cbd5e1' }}>
            <strong>Explanation:</strong>
            <InterviewMarkdown content={item.question.explanation} color="#cbd5e1" />
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Self rating: {item.selfRating ?? 'Not rated'} • Revealed in session: {item.answerRevealed ? 'Yes' : 'No'}
          </div>
        </article>
      ))}
    </div>
  )
}
