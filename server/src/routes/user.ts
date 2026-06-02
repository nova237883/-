import { Router } from 'express'
import { getUserList, createUser, updateUser, deleteUser, getProfile } from '../controllers/userController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/profile', authMiddleware, getProfile)
router.get('/list', authMiddleware, getUserList)
router.post('/', authMiddleware, createUser)
router.put('/:id', authMiddleware, updateUser)
router.delete('/:id', authMiddleware, deleteUser)

export default router
