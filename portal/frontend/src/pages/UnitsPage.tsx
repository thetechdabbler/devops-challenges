import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUnits, UnitMeta } from '../api/content.api'
import { fetchProgress, ExerciseProgress, ProgressStatus } from '../api/progress.api'

const STATUS_ICONS: Record<ProgressStatus, string> = {
  NotStarted: '○',
  InProgress: '◑',
  Completed: '●',
}

const STATUS_COLORS: Record<ProgressStatus, string> = {
  NotStarted: '#64748b',
  InProgress: '#f59e0b',
  Completed: '#22c55e',
}

export default function UnitsPage() {
  const [units, setUnits] = useState<UnitMeta[]>([])
  const [progress, setProgress] = useState<ExerciseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([fetchUnits(), fetchProgress()])
      .then(([u, p]) => { setUnits(u); setProgress(p) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function getStatus(unit: string, exercise: string): ProgressStatus {
    return progress.find((p) => p.unit === unit && p.exercise === exercise)?.status ?? 'NotStarted'
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: '#94a3b8' }}>Loading exercises…</div>
  }

  return (
    <div style={{ padding: '2rem', background: '#0f172a', flex: 1 }}>
      <h2 style={{ color: '#f1f5f9', margin: '0 0 1.5rem', fontWeight: 700 }}>Exercises</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.25rem',
      }}>
        {units.map(({ unit, exercises }) => (
          <div key={unit} style={{
            background: '#1e293b', borderRadius: 10,
            padding: '1.25rem', border: '1px solid #334155',
          }}>
            <h3 style={{
              color: '#38bdf8', margin: '0 0 0.75rem',
              fontSize: '0.95rem', fontWeight: 700, textTransform: 'capitalize',
            }}>
              {unit.replace(/-/g, ' ')}
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {exercises.map((ex) => {
                const status = getStatus(unit, ex)
                return (
                  <li key={ex}>
                    <button
                      onClick={() => navigate(`/units/${unit}/${ex}`)}
                      style={{
                        width: '100%', textAlign: 'left', background: 'transparent',
                        border: 'none', color: '#cbd5e1', cursor: 'pointer',
                        padding: '0.25rem 0', fontSize: '0.825rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                      }}
                    >
                      <span style={{ color: STATUS_COLORS[status], fontSize: '0.9rem' }}>
                        {STATUS_ICONS[status]}
                      </span>
                      {ex}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
