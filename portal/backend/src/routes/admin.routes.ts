import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { requireAdmin } from '../middleware/admin.middleware'
import { adminQuestionController } from '../controllers/admin-question.controller'

const adminRouter = Router()

// All admin routes require authentication + admin role
adminRouter.use(authenticate, requireAdmin)

adminRouter.post('/questions/generate', adminQuestionController.generate)
adminRouter.get('/questions/stats', adminQuestionController.stats)
adminRouter.get('/questions', adminQuestionController.list)
adminRouter.patch('/questions/:id', adminQuestionController.review)

export default adminRouter
