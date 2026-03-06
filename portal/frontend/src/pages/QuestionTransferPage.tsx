import { ChangeEvent, useMemo, useState } from 'react'
import { ExperienceLevel, InterviewTopic, QuestionType } from '../api/interview.api'
import {
  exportQuestionsCsv,
  importQuestionsCsv,
  ImportMode,
  QuestionTransferFilters,
  TransferQuestionStatus,
  TransferResult,
} from '../api/question-transfer.api'
import { ApiError } from '../api/client'

const TOPICS: InterviewTopic[] = [
  'Docker',
  'Kubernetes',
  'CI/CD',
  'Ansible',
  'IaC/Terraform',
  'Observability',
  'AWS',
  'General',
]

const TYPES: Array<QuestionType | 'any'> = ['any', 'theory', 'scenario']
const LEVELS: Array<ExperienceLevel | 'any'> = ['any', 'junior', 'mid', 'senior']
const STATUSES: Array<TransferQuestionStatus | 'any'> = ['any', 'active', 'pending_review', 'rejected']

export default function QuestionTransferPage() {
  const [filters, setFilters] = useState<QuestionTransferFilters>({ topics: [] })
  const [csvText, setCsvText] = useState('')
  const [mode, setMode] = useState<ImportMode>('dry-run')
  const [result, setResult] = useState<TransferResult | null>(null)
  const [loadingExport, setLoadingExport] = useState(false)
  const [loadingImport, setLoadingImport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const issuePreview = useMemo(() => (result?.issues ?? []).slice(0, 100), [result])

  function updateTopic(topic: InterviewTopic, checked: boolean) {
    const current = filters.topics ?? []
    const next = checked ? [...new Set([...current, topic])] : current.filter(t => t !== topic)
    setFilters(prev => ({ ...prev, topics: next }))
  }

  function setNullable<K extends keyof QuestionTransferFilters>(key: K, value: QuestionTransferFilters[K] | undefined) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  async function handleExport() {
    setError(null)
    setNotice(null)
    setLoadingExport(true)
    try {
      const blob = await exportQuestionsCsv(filters)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      a.href = url
      a.download = `questions-export-${stamp}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setNotice('Export downloaded successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setLoadingExport(false)
    }
  }

  async function handleImport() {
    setError(null)
    setNotice(null)
    setResult(null)

    if (!csvText.trim()) {
      setError('Upload a CSV file or paste CSV content before importing')
      return
    }

    setLoadingImport(true)
    try {
      const data = await importQuestionsCsv({ mode, csv: csvText })
      setResult(data)
      setNotice(mode === 'apply' ? 'Import applied successfully' : 'Dry-run validation completed')
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else if (err instanceof Error) setError(err.message)
      else setError('Import failed')
    } finally {
      setLoadingImport(false)
    }
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setCsvText(text)
      setNotice(`Loaded file: ${file.name}`)
      setError(null)
    } catch {
      setError('Failed to read selected file')
    }
  }

  return (
    <div style={{ padding: '1.5rem', background: '#0f172a', minHeight: '100%' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <h2 style={{ margin: 0, color: '#f1f5f9' }}>Question Import / Export</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.92rem' }}>
          Export questions as CSV, then validate or apply imports using dry-run/apply modes.
        </p>

        {error && <div style={{ color: '#fda4af', border: '1px solid #7f1d1d', background: '#3f1d2e', padding: '0.7rem', borderRadius: 8 }}>{error}</div>}
        {notice && <div style={{ color: '#86efac', border: '1px solid #166534', background: '#052e16', padding: '0.7rem', borderRadius: 8 }}>{notice}</div>}

        <section style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', color: '#e2e8f0' }}>Export Filters</h3>
          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <label style={{ color: '#cbd5e1' }}>
              Type
              <select
                value={(filters.type ?? 'any') as string}
                onChange={e => setNullable('type', e.target.value === 'any' ? undefined : (e.target.value as QuestionType))}
                style={{ marginTop: 6, width: '100%', background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '0.5rem' }}
              >
                {TYPES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>

            <label style={{ color: '#cbd5e1' }}>
              Difficulty
              <select
                value={typeof filters.difficulty === 'number' ? String(filters.difficulty) : 'any'}
                onChange={e => setNullable('difficulty', e.target.value === 'any' ? undefined : Number.parseInt(e.target.value, 10))}
                style={{ marginTop: 6, width: '100%', background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '0.5rem' }}
              >
                <option value="any">any</option>
                {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>

            <label style={{ color: '#cbd5e1' }}>
              Experience Level
              <select
                value={(filters.experienceLevel ?? 'any') as string}
                onChange={e => setNullable('experienceLevel', e.target.value === 'any' ? undefined : (e.target.value as ExperienceLevel))}
                style={{ marginTop: 6, width: '100%', background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '0.5rem' }}
              >
                {LEVELS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>

            <label style={{ color: '#cbd5e1' }}>
              Status
              <select
                value={(filters.status ?? 'any') as string}
                onChange={e => setNullable('status', e.target.value === 'any' ? undefined : (e.target.value as TransferQuestionStatus))}
                style={{ marginTop: 6, width: '100%', background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '0.5rem' }}
              >
                {STATUSES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          </div>

          <div style={{ marginTop: '0.8rem' }}>
            <div style={{ color: '#cbd5e1', marginBottom: 6 }}>Topics</div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {TOPICS.map(topic => {
                const checked = (filters.topics ?? []).includes(topic)
                return (
                  <label key={topic} style={{
                    border: `1px solid ${checked ? '#0891b2' : '#334155'}`,
                    background: checked ? '#0e7490' : '#0f172a',
                    color: checked ? '#ecfeff' : '#cbd5e1',
                    borderRadius: 999,
                    padding: '0.22rem 0.6rem',
                    fontSize: '0.78rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => updateTopic(topic, e.target.checked)}
                      style={{ margin: 0 }}
                    />
                    {topic}
                  </label>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => void handleExport()}
            disabled={loadingExport}
            style={{
              marginTop: '0.9rem',
              background: '#0369a1',
              border: 'none',
              color: '#f8fafc',
              borderRadius: 8,
              padding: '0.55rem 0.9rem',
              fontWeight: 700,
              cursor: loadingExport ? 'not-allowed' : 'pointer',
            }}
          >
            {loadingExport ? 'Exporting...' : 'Download CSV'}
          </button>
        </section>

        <section style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', color: '#e2e8f0' }}>Import CSV</h3>

          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <label style={{ color: '#cbd5e1' }}>
              Mode
              <select
                value={mode}
                onChange={e => setMode(e.target.value as ImportMode)}
                style={{ marginTop: 6, width: '100%', background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '0.5rem' }}
              >
                <option value="dry-run">dry-run (validation only)</option>
                <option value="apply">apply (persist valid rows)</option>
              </select>
            </label>

            <label style={{ color: '#cbd5e1' }}>
              Upload CSV File
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => void onFileChange(e)}
                style={{ marginTop: 6, width: '100%', color: '#cbd5e1' }}
              />
            </label>
          </div>

          <label style={{ display: 'block', marginTop: '0.75rem', color: '#cbd5e1' }}>
            CSV Content
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="Paste CSV content here (or upload a file above)..."
              rows={10}
              style={{
                marginTop: 6,
                width: '100%',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#e2e8f0',
                padding: '0.65rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.8rem',
              }}
            />
          </label>

          <button
            onClick={() => void handleImport()}
            disabled={loadingImport}
            style={{
              marginTop: '0.9rem',
              background: mode === 'apply' ? '#166534' : '#0e7490',
              border: 'none',
              color: '#f8fafc',
              borderRadius: 8,
              padding: '0.55rem 0.9rem',
              fontWeight: 700,
              cursor: loadingImport ? 'not-allowed' : 'pointer',
            }}
          >
            {loadingImport ? 'Processing...' : mode === 'apply' ? 'Apply Import' : 'Run Dry-Run'}
          </button>
        </section>

        {result && (
          <section style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', color: '#93c5fd' }}>Import Result</h3>

            <div style={{ display: 'grid', gap: '0.55rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              {[
                ['Mode', result.summary.mode],
                ['Total', String(result.summary.totalRows)],
                ['Valid', String(result.summary.validRows)],
                ['Invalid', String(result.summary.invalidRows)],
                ['Inserted', String(result.summary.insertedRows)],
                ['Duplicates', String(result.summary.duplicateRows)],
              ].map(([label, value]) => (
                <div key={label} style={{ border: '1px solid #334155', borderRadius: 8, padding: '0.55rem', background: '#1e293b' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{label}</div>
                  <div style={{ marginTop: 3, color: '#f8fafc', fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '0.85rem' }}>
              <h4 style={{ margin: '0 0 0.45rem', color: '#cbd5e1' }}>Issues ({result.issues.length})</h4>
              {issuePreview.length === 0 ? (
                <div style={{ color: '#86efac' }}>No issues detected.</div>
              ) : (
                <div style={{ maxHeight: 280, overflow: 'auto', border: '1px solid #334155', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead style={{ background: '#1e293b', color: '#93c5fd' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '0.45rem', borderBottom: '1px solid #334155' }}>Row</th>
                        <th style={{ textAlign: 'left', padding: '0.45rem', borderBottom: '1px solid #334155' }}>Field</th>
                        <th style={{ textAlign: 'left', padding: '0.45rem', borderBottom: '1px solid #334155' }}>Code</th>
                        <th style={{ textAlign: 'left', padding: '0.45rem', borderBottom: '1px solid #334155' }}>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuePreview.map((issue, idx) => (
                        <tr key={`${issue.rowIndex}-${issue.code}-${idx}`}>
                          <td style={{ padding: '0.42rem', borderBottom: '1px solid #1e293b', color: '#cbd5e1' }}>{issue.rowIndex}</td>
                          <td style={{ padding: '0.42rem', borderBottom: '1px solid #1e293b', color: '#cbd5e1' }}>{issue.field}</td>
                          <td style={{ padding: '0.42rem', borderBottom: '1px solid #1e293b', color: '#facc15' }}>{issue.code}</td>
                          <td style={{ padding: '0.42rem', borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}>{issue.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {result.issues.length > issuePreview.length && (
                <div style={{ marginTop: 8, color: '#94a3b8', fontSize: '0.8rem' }}>
                  Showing first {issuePreview.length} issues.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
