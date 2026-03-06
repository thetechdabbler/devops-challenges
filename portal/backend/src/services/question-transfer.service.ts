import { ExperienceLevel, QuestionStatus, QuestionType, Topic } from '@prisma/client'
import { createHash } from 'crypto'
import { BadRequestError } from '../lib/errors'
import { parseQuestionCsv, serializeQuestionRows } from '../lib/question-transfer/csv'
import {
  ImportResult,
  ImportValidationIssue,
  QuestionExportFilters,
  QuestionTransferRow,
} from '../lib/question-transfer/types'
import { questionRepository } from '../repositories/question.repository'

const TOPICS = new Set(Object.values(Topic))
const TYPES = new Set(Object.values(QuestionType))
const LEVELS = new Set(Object.values(ExperienceLevel))
const STATUSES = new Set(Object.values(QuestionStatus))

function parseList(value: string): string[] {
  return value
    .split('|')
    .map(v => v.trim())
    .filter(Boolean)
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function toFingerprint(row: QuestionTransferRow): string {
  const normalizedText = normalizeText(row.text).toLowerCase()
  const topics = [...new Set(row.topics)].sort().join(',')
  const source = [
    normalizedText,
    row.type,
    String(row.difficulty),
    row.experienceLevel,
    topics,
  ].join('|')

  return createHash('sha256').update(source).digest('hex')
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

function validateRow(
  row: Record<string, string>,
  rowIndex: number
): { row: QuestionTransferRow | null; issues: ImportValidationIssue[] } {
  const issues: ImportValidationIssue[] = []

  const text = normalizeText(row.text)
  if (!text) {
    issues.push({ rowIndex, field: 'text', code: 'REQUIRED', message: 'text is required' })
  }

  const topicsRaw = parseList(row.topics)
  if (topicsRaw.length === 0) {
    issues.push({ rowIndex, field: 'topics', code: 'REQUIRED', message: 'at least one topic is required' })
  }
  const topics = topicsRaw.filter((t): t is Topic => TOPICS.has(t as Topic))
  if (topics.length !== topicsRaw.length) {
    issues.push({ rowIndex, field: 'topics', code: 'INVALID_ENUM', message: 'topics contains invalid values' })
  }

  const type = row.type as QuestionType
  if (!TYPES.has(type)) {
    issues.push({ rowIndex, field: 'type', code: 'INVALID_ENUM', message: 'type must be theory or scenario' })
  }

  const difficulty = Number.parseInt(row.difficulty, 10)
  if (!Number.isFinite(difficulty) || difficulty < 1 || difficulty > 5) {
    issues.push({ rowIndex, field: 'difficulty', code: 'INVALID_RANGE', message: 'difficulty must be between 1 and 5' })
  }

  const experienceLevel = row.experience_level as ExperienceLevel
  if (!LEVELS.has(experienceLevel)) {
    issues.push({ rowIndex, field: 'experience_level', code: 'INVALID_ENUM', message: 'experience_level must be junior, mid, or senior' })
  }

  const answer = normalizeText(row.answer)
  if (!answer) {
    issues.push({ rowIndex, field: 'answer', code: 'REQUIRED', message: 'answer is required' })
  }

  const explanation = normalizeText(row.explanation)
  if (!explanation) {
    issues.push({ rowIndex, field: 'explanation', code: 'REQUIRED', message: 'explanation is required' })
  }

  const status = row.status as QuestionStatus
  if (!STATUSES.has(status)) {
    issues.push({ rowIndex, field: 'status', code: 'INVALID_ENUM', message: 'status is invalid' })
  }

  const keyConcepts = parseList(row.key_concepts)

  if (issues.length > 0) {
    return { row: null, issues }
  }

  const normalized: QuestionTransferRow = {
    text,
    topics: [...new Set(topics)].sort(),
    type,
    difficulty,
    experienceLevel,
    answer,
    explanation,
    keyConcepts: [...new Set(keyConcepts)],
    status,
  }

  return { row: normalized, issues }
}

export const questionTransferService = {
  async exportQuestionsCsv(filters: QuestionExportFilters): Promise<string> {
    const rows = await questionRepository.findForTransferExport(filters)
    return serializeQuestionRows(rows)
  },

  async validateImport(csv: string, mode: 'dry-run' | 'apply'): Promise<ImportResult> {
    if (!csv || !csv.trim()) {
      throw new BadRequestError('csv is required')
    }

    if (mode !== 'dry-run' && mode !== 'apply') {
      throw new BadRequestError('mode must be dry-run or apply')
    }

    const parsed = parseQuestionCsv(csv)
    const issues: ImportValidationIssue[] = []
    const validRows: Array<{ row: QuestionTransferRow; rowIndex: number; fingerprint: string }> = []
    const seenFingerprints = new Set<string>()
    let duplicateRows = 0

    parsed.forEach((row, i) => {
      const rowIndex = i + 2
      const result = validateRow(row, rowIndex)

      if (!result.row) {
        issues.push(...result.issues)
        return
      }

      const fingerprint = toFingerprint(result.row)
      if (seenFingerprints.has(fingerprint)) {
        duplicateRows++
        issues.push({
          rowIndex,
          field: 'text',
          code: 'DUPLICATE_IN_FILE',
          message: 'duplicate row detected in uploaded csv',
        })
        return
      }

      seenFingerprints.add(fingerprint)
      validRows.push({ row: result.row, rowIndex, fingerprint })
    })

    if (mode === 'dry-run') {
      return {
        summary: {
          totalRows: parsed.length,
          validRows: validRows.length,
          invalidRows: parsed.length - validRows.length,
          insertedRows: 0,
          duplicateRows,
          mode,
        },
        issues,
      }
    }

    const writeRows: QuestionTransferRow[] = []
    for (const item of validRows) {
      const exists = await questionRepository.existsForTransferImport(item.row)
      if (exists) {
        duplicateRows++
        issues.push({
          rowIndex: item.rowIndex,
          field: 'text',
          code: 'DUPLICATE_IN_BANK',
          message: 'duplicate row already exists in question bank',
        })
        continue
      }

      writeRows.push(item.row)
    }

    const CHUNK_SIZE = 200
    let insertedRows = 0

    for (const group of chunk(writeRows, CHUNK_SIZE)) {
      const ids = await questionRepository.saveBatch(
        group.map(q => ({
          text: q.text,
          type: q.type,
          topics: q.topics,
          difficulty: q.difficulty,
          experienceLevel: q.experienceLevel,
          source: 'bank',
          status: q.status,
          answer: q.answer,
          explanation: q.explanation,
          keyConcepts: q.keyConcepts,
        }))
      )
      insertedRows += ids.length
    }

    return {
      summary: {
        totalRows: parsed.length,
        validRows: validRows.length,
        invalidRows: parsed.length - validRows.length,
        insertedRows,
        duplicateRows,
        mode,
      },
      issues,
    }
  },
}
