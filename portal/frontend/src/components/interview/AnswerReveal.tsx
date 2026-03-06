import { RevealResponse } from '../../api/interview.api'
import InterviewMarkdown from './InterviewMarkdown'

type Props = {
  loading: boolean
  error: string | null
  revealed: RevealResponse | null
  onReveal: () => void
}

export default function AnswerReveal({ loading, error, revealed, onReveal }: Props) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <button
        onClick={onReveal}
        disabled={loading || Boolean(revealed)}
        style={{
          alignSelf: 'flex-start',
          background: revealed ? '#14532d' : '#0891b2',
          color: '#f8fafc',
          border: 'none',
          borderRadius: 8,
          padding: '0.55rem 0.9rem',
          fontWeight: 700,
          cursor: loading || revealed ? 'not-allowed' : 'pointer',
        }}
      >
        {revealed ? 'Answer Revealed ✓' : loading ? 'Revealing...' : 'Reveal Answer'}
      </button>

      {error && (
        <div style={{ color: '#fda4af', background: '#3f1d2e', border: '1px solid #7f1d1d', padding: '0.6rem', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {revealed && (
        <div style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 10,
          padding: '0.9rem',
          color: '#dbeafe',
          opacity: 1,
          transition: 'opacity 240ms ease-in',
        }}>
          <h4 style={{ margin: '0 0 0.45rem', color: '#93c5fd' }}>Answer</h4>
          <div style={{ margin: '0 0 0.75rem' }}>
            <InterviewMarkdown content={revealed.answer} color="#e2e8f0" />
          </div>
          <h4 style={{ margin: '0 0 0.45rem', color: '#93c5fd' }}>Explanation</h4>
          <div style={{ margin: '0 0 0.75rem' }}>
            <InterviewMarkdown content={revealed.explanation} color="#cbd5e1" />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {revealed.keyConcepts.map(concept => (
              <span key={concept} style={{
                border: '1px solid #475569',
                borderRadius: 999,
                padding: '0.12rem 0.5rem',
                fontSize: '0.75rem',
                color: '#cbd5e1',
              }}>
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
