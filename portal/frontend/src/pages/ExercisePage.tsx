import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchFileContent } from '../api/content.api'
import { fetchNote } from '../api/notes.api'
import {
  endSession, fetchProgress, getSessionTotal,
  ProgressStatus, SessionTotals, startSession, updateStatus,
} from '../api/progress.api'
import ContentViewer from '../components/ContentViewer'
import NotesEditor from '../components/NotesEditor'
import StatusSelector from '../components/StatusSelector'
import TimerWidget from '../components/TimerWidget'

export default function ExercisePage() {
  const { unit, exercise } = useParams<{ unit: string; exercise: string }>()
  const [content, setContent] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [status, setStatus] = useState<ProgressStatus>('NotStarted')
  const [totals, setTotals] = useState<SessionTotals>({ totalSeconds: 0, isActive: false, activeStartedAt: null })
  const [loaded, setLoaded] = useState(false)
  const sessionActive = useRef(false)

  const stopSession = useCallback(async () => {
    if (sessionActive.current) {
      sessionActive.current = false
      await endSession().catch(console.error)
    }
  }, [])

  useEffect(() => {
    if (!unit || !exercise) return

    let cancelled = false
    setLoaded(false)

    async function loadAll() {
      try {
        await startSession(unit!, exercise!)
        if (cancelled) return
        sessionActive.current = true

        const [c, note, t, allProgress] = await Promise.all([
          fetchFileContent(unit!, exercise!, 'challenge.md'),
          fetchNote(unit!, exercise!),
          getSessionTotal(unit!, exercise!),
          fetchProgress(),
        ])
        if (cancelled) return

        setContent(c)
        setNoteContent(note?.content ?? '')
        setTotals({ ...t, isActive: true, activeStartedAt: new Date().toISOString() })
        const prog = allProgress.find((p) => p.unit === unit && p.exercise === exercise)
        if (prog) setStatus(prog.status)
        setLoaded(true)
      } catch (err) {
        console.error(err)
        if (!cancelled) setLoaded(true)
      }
    }

    void loadAll()

    return () => {
      cancelled = true
      void stopSession()
    }
  }, [unit, exercise, stopSession])

  useEffect(() => {
    function handleBeforeUnload() {
      if (sessionActive.current && unit && exercise) {
        sessionActive.current = false
        navigator.sendBeacon(
          '/api/progress/sessions/end',
          new Blob([JSON.stringify({})], { type: 'application/json' })
        )
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [unit, exercise])

  async function handleStatusChange(s: ProgressStatus) {
    if (!unit || !exercise) return
    setStatus(s)
    await updateStatus(unit, exercise, s).catch(console.error)
  }

  if (!unit || !exercise) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#0f172a' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.6rem 1.5rem', background: '#1e293b',
        borderBottom: '1px solid #334155', flexShrink: 0,
      }}>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
          {unit} / {exercise}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TimerWidget
            totalSeconds={totals.totalSeconds}
            isActive={totals.isActive}
            activeStartedAt={totals.activeStartedAt}
          />
          <StatusSelector status={status} onChange={(s) => void handleStatusChange(s)} />
        </div>
      </div>

      {/* Split pane */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, borderRight: '1px solid #334155', overflow: 'hidden' }}>
          {loaded ? (
            <ContentViewer content={content} />
          ) : (
            <div style={{ padding: '2rem', color: '#64748b' }}>Loading…</div>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '0.4rem 1rem', borderBottom: '1px solid #334155',
            color: '#475569', fontSize: '0.75rem', background: '#1e293b',
          }}>
            Notes (autosaves)
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {loaded && (
              <NotesEditor
                key={`${unit}/${exercise}`}
                unit={unit}
                exercise={exercise}
                initialContent={noteContent}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
