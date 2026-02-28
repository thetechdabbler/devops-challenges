import { Request, Response } from 'express'
import { contentService } from '../services/content.service'

export const contentController = {
  listUnits: (_req: Request, res: Response): void => {
    const units = contentService.getUnitsIndex()
    res.json({ units })
  },

  getFile: (req: Request, res: Response): void => {
    const { unit, exercise, file } = req.params
    const content = contentService.getFileContent(unit, exercise, file)
    res.json({ content })
  },
}
