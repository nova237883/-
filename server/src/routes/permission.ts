import { Router } from 'express'
import { getMenus, getPermissions, getAllMenus } from '../controllers/permissionController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/menus', authMiddleware, getMenus)
router.get('/permissions', authMiddleware, getPermissions)
router.get('/menus/all', authMiddleware, getAllMenus)

export default router
