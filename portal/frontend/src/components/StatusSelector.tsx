import { ProgressStatus } from '../api/progress.api'

interface StatusSelectorProps {
  status: ProgressStatus
  onChange: (status: ProgressStatus) => void
}

const STATUSES: ProgressStatus[] = ['NotStarted', 'InProgress', 'Completed']

const LABELS: Record<ProgressStatus, string> = {
  NotStarted: '○ Not Started',
  InProgress: '◑ In Progress',
  Completed: '● Completed',
}

const COLORS: Record<ProgressStatus, string> = {
  NotStarted: '#64748b',
  InProgress: '#f59e0b',
  Completed: '#22c55e',
}

export default function StatusSelector({ status, onChange }: StatusSelectorProps) {
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as ProgressStatus)}
      style={{
        padding: '0.3rem 0.75rem',
        border: `2px solid ${COLORS[status]}`,
        borderRadius: 6,
        color: COLORS[status],
        fontWeight: 600,
        background: '#1e293b',
        cursor: 'pointer',
        fontSize: '0.875rem',
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{LABELS[s]}</option>
      ))}
    </select>
  )
}
