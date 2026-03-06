type Props = {
  loading: boolean
  selectedRating: number | null
  error: string | null
  onRate: (rating: number) => void
  onSkipNext: () => void
  onNext: () => void
}

const LABELS: Record<number, string> = {
  1: 'Missed it',
  2: 'Partial',
  3: 'Got the gist',
  4: 'Good',
  5: 'Nailed it',
}

export default function SelfRating({
  loading,
  selectedRating,
  error,
  onRate,
  onSkipNext,
  onNext,
}: Props) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h4 style={{ margin: 0, color: '#e2e8f0' }}>Rate Your Answer</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            onClick={() => onRate(rating)}
            disabled={loading}
            style={{
              border: selectedRating === rating ? '1px solid #38bdf8' : '1px solid #475569',
              borderRadius: 8,
              background: selectedRating === rating ? '#0c4a6e' : '#0f172a',
              color: '#e2e8f0',
              padding: '0.45rem 0.6rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              minWidth: 110,
            }}
          >
            {rating} - {LABELS[rating]}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: '#fda4af', background: '#3f1d2e', border: '1px solid #7f1d1d', padding: '0.6rem', borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.55rem' }}>
        <button
          onClick={onSkipNext}
          disabled={loading}
          style={{
            background: 'transparent',
            color: '#cbd5e1',
            border: '1px solid #475569',
            borderRadius: 8,
            padding: '0.5rem 0.8rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          Skip & Next
        </button>
        <button
          onClick={onNext}
          disabled={loading || selectedRating === null}
          style={{
            background: selectedRating === null ? '#334155' : '#0284c7',
            color: '#f8fafc',
            border: 'none',
            borderRadius: 8,
            padding: '0.5rem 0.8rem',
            cursor: loading || selectedRating === null ? 'not-allowed' : 'pointer',
            fontWeight: 700,
          }}
        >
          Next Question
        </button>
      </div>
    </section>
  )
}
