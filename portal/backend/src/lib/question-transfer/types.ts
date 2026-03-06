import { ExperienceLevel, QuestionStatus, QuestionType, Topic } from '@prisma/client'

export type QuestionExportFilters = {
  topics?: Topic[]
  type?: QuestionType
  difficulty?: number
  experienceLevel?: ExperienceLevel
  status?: QuestionStatus
}

export type QuestionTransferRow = {
  text: string
  topics: Topic[]
  type: QuestionType
  difficulty: number
  experienceLevel: ExperienceLevel
  answer: string
  explanation: string
  keyConcepts: string[]
  status: QuestionStatus
}

export type ImportValidationIssue = {
  rowIndex: number
  field: string
  code: string
  message: string
}

export type ImportSummary = {
  totalRows: number
  validRows: number
  invalidRows: number
  insertedRows: number
  duplicateRows: number
  mode: 'dry-run' | 'apply'
}

export type ImportResult = {
  summary: ImportSummary
  issues: ImportValidationIssue[]
}

export type DryRunValidationResult = ImportResult
