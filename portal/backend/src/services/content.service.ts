import fs from 'node:fs'
import path from 'node:path'
import { log } from '../lib/logger'
import { NotFoundError } from '../lib/errors'

export interface UnitMeta {
  unit: string
  exercises: string[]
}

const contentIndex = new Map<string, Set<string>>()
const fileCache = new Map<string, string>()

export const contentService = {
  initialize(): void {
    const contentPath = process.env.CONTENT_PATH!

    if (!fs.existsSync(contentPath)) {
      log.fatal({ contentPath }, 'CONTENT_PATH does not exist')
      process.exit(1)
    }

    const units = fs
      .readdirSync(contentPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort()

    let totalExercises = 0
    for (const unit of units) {
      const exercises = fs
        .readdirSync(path.join(contentPath, unit), { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .sort()
      contentIndex.set(unit, new Set(exercises))
      totalExercises += exercises.length
    }

    log.info({ units: units.length, totalExercises }, 'Content index built')
  },

  __resetForTesting(): void {
    contentIndex.clear()
    fileCache.clear()
  },

  getUnitsIndex(): UnitMeta[] {
    return Array.from(contentIndex.entries()).map(([unit, exercises]) => ({
      unit,
      exercises: Array.from(exercises),
    }))
  },

  getFileContent(unit: string, exercise: string, file: string): string {
    if (!contentIndex.has(unit)) {
      throw new NotFoundError(`Unit not found: ${unit}`)
    }
    if (!contentIndex.get(unit)!.has(exercise)) {
      throw new NotFoundError(`Exercise not found: ${exercise}`)
    }
    if (/[/\\]|\.\./.test(file)) {
      throw new NotFoundError('File not found')
    }

    const cacheKey = `${unit}/${exercise}/${file}`
    const cached = fileCache.get(cacheKey)
    if (cached !== undefined) return cached

    const filePath = path.join(process.env.CONTENT_PATH!, unit, exercise, file)
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError(`File not found: ${file}`)
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    fileCache.set(cacheKey, content)
    return content
  },
}
