import type { Request, Response } from 'express'
import type { ResultSetHeader } from 'mysql2'
import type { ApiResponse } from '../types/index.js'
import {
  getKpiData,
  getTrendData,
  getRankingData,
  getDistributionData,
  getMapData,
  getRegionTrendData,
  getRegionRankingData,
  getRegionDistributionData,
  pool
} from '../services/dataService.js'

export async function getOverview(_req: Request, res: Response) {
  try {
    const data = await getKpiData()
    const response: ApiResponse<typeof data> = { code: 0, data, message: 'success' }
    res.json(response)
  } catch (err) {
    console.error('getOverview error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function getTrend(req: Request, res: Response) {
  try {
    const range = (req.query.range as string) || '24h'
    const data = await getTrendData(range)
    const response: ApiResponse<typeof data> = { code: 0, data, message: 'success' }
    res.json(response)
  } catch (err) {
    console.error('getTrend error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function getRanking(req: Request, res: Response) {
  try {
    const region = req.query.region as string | undefined
    const data = await getRankingData(region)
    const response: ApiResponse<typeof data> = { code: 0, data, message: 'success' }
    res.json(response)
  } catch (err) {
    console.error('getRanking error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function getDistribution(req: Request, res: Response) {
  try {
    const region = req.query.region as string | undefined
    const data = await getDistributionData(region)
    const response: ApiResponse<typeof data> = { code: 0, data, message: 'success' }
    res.json(response)
  } catch (err) {
    console.error('getDistribution error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function getMap(_req: Request, res: Response) {
  try {
    const data = await getMapData()
    const response: ApiResponse<typeof data> = { code: 0, data, message: 'success' }
    res.json(response)
  } catch (err) {
    console.error('getMap error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function getOrderList(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 15
    const offset = (page - 1) * pageSize

    const [countRows] = await pool.query<any[]>('SELECT COUNT(*) AS total FROM orders')
    const total = countRows[0].total

    const [rows] = await pool.query<any[]>(
      'SELECT id, order_no, user_id, amount, status, region, category, created_at FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    )
    const response: ApiResponse<{ list: typeof rows; total: number; page: number; pageSize: number }> = {
      code: 0, data: { list: rows, total, page, pageSize }, message: 'success'
    }
    res.json(response)
  } catch (err) {
    console.error('getOrderList error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function getRegionDetail(req: Request, res: Response) {
  try {
    const region = req.query.region as string
    if (!region) {
      return res.status(400).json({ code: -1, data: null, message: 'region 参数不能为空' })
    }
    const [trend, ranking, distribution] = await Promise.all([
      getRegionTrendData(region),
      getRegionRankingData(region),
      getRegionDistributionData(region)
    ])
    const response: ApiResponse<{ trend: typeof trend; ranking: typeof ranking; distribution: typeof distribution }> = {
      code: 0,
      data: { trend, ranking, distribution },
      message: 'success'
    }
    res.json(response)
  } catch (err) {
    console.error('getRegionDetail error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    const { order_no, user_id, amount, status, region, category } = req.body
    if (!order_no || !user_id || !amount || !region || !category) {
      return res.status(400).json({ code: -1, data: null, message: '订单号、用户ID、金额、地区、品类不能为空' })
    }
    const validStatus = ['pending', 'completed', 'cancelled']
    const orderStatus = validStatus.includes(status) ? status : 'pending'
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO orders (order_no, user_id, amount, status, region, category) VALUES (?, ?, ?, ?, ?, ?)',
      [order_no, user_id, amount, orderStatus, region, category]
    )
    const response: ApiResponse<{ id: number }> = { code: 0, data: { id: result.insertId }, message: '创建成功' }
    res.json(response)
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: -1, data: null, message: '订单号已存在' })
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_FK_NO_REFERENCED_ROW') {
      return res.status(400).json({ code: -1, data: null, message: '用户ID不存在' })
    }
    console.error('[Dashboard] createOrder error:', err?.sqlMessage || err?.message || err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function updateOrder(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    const { amount, status, region, category } = req.body
    const updates: string[] = []
    const params: any[] = []

    if (amount !== undefined) { updates.push('amount = ?'); params.push(amount) }
    if (status !== undefined) { updates.push('status = ?'); params.push(status) }
    if (region !== undefined) { updates.push('region = ?'); params.push(region) }
    if (category !== undefined) { updates.push('category = ?'); params.push(category) }

    if (updates.length === 0) {
      return res.status(400).json({ code: -1, data: null, message: '没有需要更新的字段' })
    }

    params.push(id)
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: -1, data: null, message: '订单不存在' })
    }
    res.json({ code: 0, data: null, message: '更新成功' })
  } catch (err: any) {
    console.error('[Dashboard] updateOrder error:', err?.sqlMessage || err?.message || err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function deleteOrder(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM orders WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: -1, data: null, message: '订单不存在' })
    }
    res.json({ code: 0, data: null, message: '删除成功' })
  } catch (err: any) {
    console.error('[Dashboard] deleteOrder error:', err?.sqlMessage || err?.message || err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}
