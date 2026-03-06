import { BadRequestError } from '../errors'
import { QuestionTransferRow } from './types'

export const CSV_COLUMNS = [
  'text',
  'topics',
  'type',
  'difficulty',
  'experience_level',
  'answer',
  'explanation',
  'key_concepts',
  'status',
] as const

type CsvColumn = typeof CSV_COLUMNS[number]

function escapeCell(value: string): string {
  if (/[,"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function serializeQuestionRows(rows: QuestionTransferRow[]): string {
  const header = CSV_COLUMNS.join(',')
  const lines = rows.map(row => {
    const values = [
      row.text,
      row.topics.join('|'),
      row.type,
      String(row.difficulty),
      row.experienceLevel,
      row.answer,
      row.explanation,
      row.keyConcepts.join('|'),
      row.status,
    ]
    return values.map(escapeCell).join(',')
  })
  return [header, ...lines].join('\n')
}

function parseCsvContent(content: string): string[][] {
  const rows: string[][] = []
  let cell = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    const next = content[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && ch === ',') {
      row.push(cell)
      cell = ''
      continue
    }

    if (!inQuotes && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && next === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += ch
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

export function parseQuestionCsv(content: string): Array<Record<CsvColumn, string>> {
  const trimmed = content.trim()
  if (!trimmed) {
    throw new BadRequestError('csv content is empty')
  }

  const rawRows = parseCsvContent(trimmed)
  if (rawRows.length === 0) {
    throw new BadRequestError('csv content is empty')
  }

  const header = rawRows[0].map(v => v.trim())
  for (const col of CSV_COLUMNS) {
    if (!header.includes(col)) {
      throw new BadRequestError(`Missing required CSV column: ${col}`)
    }
  }

  const indexByCol = new Map<CsvColumn, number>()
  for (const col of CSV_COLUMNS) {
    indexByCol.set(col, header.indexOf(col))
  }

  const result: Array<Record<CsvColumn, string>> = []
  for (let i = 1; i < rawRows.length; i++) {
    const r = rawRows[i]
    const empty = r.every(cell => cell.trim() === '')
    if (empty) continue

    const obj = {} as Record<CsvColumn, string>
    for (const col of CSV_COLUMNS) {
      const idx = indexByCol.get(col)!
      obj[col] = (r[idx] ?? '').trim()
    }
    result.push(obj)
  }

  return result
}
