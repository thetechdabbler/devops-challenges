import { useEffect, useRef, useState } from 'react'

interface TimerWidgetProps {
  totalSeconds: number
  isActive: boolean
  activeStartedAt: string | null
}

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function TimerWidget({ totalSeconds, isActive, activeStartedAt }: TimerWidgetProps) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (isActive && activeStartedAt) {
      const start = new Date(activeStartedAt).getTime()
      setElapsed(Math.floor((Date.now() - start) / 1000))
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000))
      }, 1000)
    } else {
      setElapsed(0)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, activeStartedAt])

  return (
    <span style={{
      fontFamily: 'monospace', fontSize: '1rem',
      background: '#0f172a', color: '#38bdf8',
      padding: '0.25rem 0.75rem', borderRadius: 6,
      border: '1px solid #1e3a5f',
    }}>
      ⏱ {fmt(totalSeconds + elapsed)}
    </span>
  )
}
