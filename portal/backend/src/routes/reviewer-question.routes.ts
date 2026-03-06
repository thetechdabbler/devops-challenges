import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { requireReviewer } from '../middleware/reviewer.middleware'
import { reviewerQuestionController } from '../controllers/reviewer-question.controller'

const reviewerQuestionRouter = Router()

reviewerQuestionRouter.use(authenticate, requireReviewer)
reviewerQuestionRouter.get('/questions', reviewerQuestionController.list)
reviewerQuestionRouter.post('/questions', reviewerQuestionController.create)
reviewerQuestionRouter.patch('/questions/:id', reviewerQuestionController.update)
reviewerQuestionRouter.post('/questions/:id/archive', reviewerQuestionController.archive)
reviewerQuestionRouter.get('/questions/:id/audit', reviewerQuestionController.audit)

export default reviewerQuestionRouter
