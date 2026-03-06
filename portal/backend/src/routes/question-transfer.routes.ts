import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { questionTransferController } from '../controllers/question-transfer.controller'

const questionTransferRouter = Router()

questionTransferRouter.use(authenticate)

questionTransferRouter.get('/export', questionTransferController.exportCsv)
questionTransferRouter.post('/import', questionTransferController.importCsv)

export default questionTransferRouter
