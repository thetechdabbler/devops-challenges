import { Router } from 'express'
import { contentController } from '../controllers/content.controller'

const contentRouter = Router()

contentRouter.get('/units', contentController.listUnits)
contentRouter.get('/:unit/:exercise/:file', contentController.getFile)

export default contentRouter
