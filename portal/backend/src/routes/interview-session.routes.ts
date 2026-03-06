import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { interviewSessionController } from '../controllers/interview-session.controller'

const interviewSessionRouter = Router()

interviewSessionRouter.use(authenticate)

interviewSessionRouter.get('/', interviewSessionController.list)
interviewSessionRouter.post('/', interviewSessionController.create)
interviewSessionRouter.get('/:id/questions/current', interviewSessionController.getCurrentQuestion)
interviewSessionRouter.post('/:sessionId/questions/:questionId/reveal', interviewSessionController.reveal)
interviewSessionRouter.post('/:sessionId/questions/:questionId/rate', interviewSessionController.rate)
interviewSessionRouter.get('/:id', interviewSessionController.detail)

export default interviewSessionRouter
