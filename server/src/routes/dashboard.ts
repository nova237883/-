import { Router } from 'express'
import {
  getOverview,
  getTrend,
  getRanking,
  getDistribution,
  getMap,
  getRegionDetail,
  getOrderList,
  createOrder,
  updateOrder,
  deleteOrder
} from '../controllers/dashboardController.js'

const router = Router()

router.get('/overview', getOverview)
router.get('/trend', getTrend)
router.get('/ranking', getRanking)
router.get('/distribution', getDistribution)
router.get('/map', getMap)
router.get('/region-detail', getRegionDetail)
router.get('/orders', getOrderList)
router.post('/orders', createOrder)
router.put('/orders/:id', updateOrder)
router.delete('/orders/:id', deleteOrder)

export default router
