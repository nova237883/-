import { Router } from 'express'
import { login, profile } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/login', login)
router.get('/profile', authMiddleware, profile)

export default router
