import { Request, Response, NextFunction } from 'express'
import { ExperienceLevel, QuestionStatus, QuestionType, Topic } from '@prisma/client'
import { BadRequestError } from '../lib/errors'
import { questionTransferService } from '../services/question-transfer.service'

const TOPICS = new Set(Object.values(Topic))
const TYPES = new Set(Object.values(QuestionType))
const LEVELS = new Set(Object.values(ExperienceLevel))
const STATUSES = new Set(Object.values(QuestionStatus))

function parseTopics(value: string | undefined): Topic[] | undefined {
  if (!value) return undefined
  const arr = value.split(',').map(v => v.trim()).filter(Boolean)
  if (arr.length === 0) return undefined
  for (const t of arr) {
    if (!TOPICS.has(t as Topic)) {
      throw new BadRequestError(`Invalid topic: ${t}`)
    }
  }
  return arr as Topic[]
}

export const questionTransferController = {
  async exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const typeRaw = req.query.type as string | undefined
      const levelRaw = req.query.experience_level as string | undefined
      const statusRaw = req.query.status as string | undefined
      const difficultyRaw = req.query.difficulty as string | undefined

      if (typeRaw && !TYPES.has(typeRaw as QuestionType)) {
        throw new BadRequestError('Invalid type')
      }
      if (levelRaw && !LEVELS.has(levelRaw as ExperienceLevel)) {
        throw new BadRequestError('Invalid experience_level')
      }
      if (statusRaw && !STATUSES.has(statusRaw as QuestionStatus)) {
        throw new BadRequestError('Invalid status')
      }

      let difficulty: number | undefined
      if (difficultyRaw !== undefined) {
        difficulty = Number.parseInt(difficultyRaw, 10)
        if (!Number.isFinite(difficulty) || difficulty < 1 || difficulty > 5) {
          throw new BadRequestError('difficulty must be between 1 and 5')
        }
      }

      const csv = await questionTransferService.exportQuestionsCsv({
        topics: parseTopics(req.query.topics as string | undefined),
        type: typeRaw as QuestionType | undefined,
        difficulty,
        experienceLevel: levelRaw as ExperienceLevel | undefined,
        status: statusRaw as QuestionStatus | undefined,
      })

      const filename = `questions-export-${new Date().toISOString()}.csv`
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`)
      res.status(200).send(csv)
    } catch (err) {
      next(err)
    }
  },

  async importCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mode, csv } = req.body as { mode?: string; csv?: string }
      if (!mode) throw new BadRequestError('mode is required')
      if (!csv) throw new BadRequestError('csv is required')

      const result = await questionTransferService.validateImport(
        csv,
        mode as 'dry-run' | 'apply'
      )

      res.json({ status: 'success', data: result })
    } catch (err) {
      next(err)
    }
  },
}
