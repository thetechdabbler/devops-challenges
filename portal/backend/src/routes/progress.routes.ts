import { Router } from 'express'
import { progressController } from '../controllers/progress.controller'

const progressRouter = Router()

progressRouter.get('/', progressController.getAll)
progressRouter.put('/:unit/:exercise', progressController.updateStatus)
progressRouter.post('/sessions/start', progressController.startSession)
progressRouter.post('/sessions/end', progressController.endSession)
progressRouter.get('/sessions/:unit/:exercise/total', progressController.getSessionTotal)

export default progressRouter
