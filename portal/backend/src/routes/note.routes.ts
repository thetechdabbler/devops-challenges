import { Router } from 'express'
import { noteController } from '../controllers/note.controller'

const noteRouter = Router()

noteRouter.get('/', noteController.getAll)

// /global must be registered before /:unit to avoid Express matching 'global' as a param
noteRouter.get('/global', noteController.getNote)
noteRouter.put('/global', noteController.upsertNote)

noteRouter.get('/:unit', noteController.getNote)
noteRouter.put('/:unit', noteController.upsertNote)

noteRouter.get('/:unit/:exercise', noteController.getNote)
noteRouter.put('/:unit/:exercise', noteController.upsertNote)

export default noteRouter
