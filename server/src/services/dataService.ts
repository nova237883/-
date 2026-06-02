import mysql from 'mysql2/promise'
import { dbConfig } from '../config/database.js'
import type { KpiData, TrendItem, RankingItem, DistributionItem, MapItem } from '../types/index.js'

const pool = mysql.createPool(dbConfig)

export { pool }

async function getLatestDate(): Promise<string> {
  const [rows] = await pool.execute<any[]>('SELECT MAX(stat_date) AS maxDate FROM daily_summary')
  return rows[0]?.maxDate || '2026-05-25'
}

export async function getKpiData(): Promise<KpiData> {
  const today = await getLatestDate()
  const yesterdayDate = new Date(today)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().split('T')[0]

  const [[todayRow], [yesterdayRow], [userRow], [allRow]] = await Promise.all([
    pool.execute<any[]>('SELECT total_orders, total_sales FROM daily_summary WHERE stat_date = ?', [today]),
    pool.execute<any[]>('SELECT total_orders, total_sales FROM daily_summary WHERE stat_date = ?', [yesterday]),
    pool.execute<any[]>('SELECT COUNT(*) AS total FROM users'),
    pool.execute<any[]>('SELECT COALESCE(SUM(total_orders), 0) AS totalOrders, COALESCE(SUM(total_sales), 0) AS totalSales FROM daily_summary')
  ])

  const us = userRow[0]
  const ast = allRow[0]
  const ts = todayRow[0] || { total_orders: 0, total_sales: 0 }
  const ys = yesterdayRow[0] || { total_orders: 0, total_sales: 0 }

  const totalSales = Math.round(Number(ast.totalSales))
  const orderCount = Number(ast.totalOrders)
  const todaySales = Math.round(Number(ts.total_sales))
  const prevSales = Math.round(Number(ys.total_sales)) || 1
  const todayOrders = Number(ts.total_orders)
  const prevOrders = Number(ys.total_orders) || 1

  const activeUsers = Math.max(Math.round(Number(us.total) * 0.6), 1)
  const prevUsers = Math.max(Math.round(Number(us.total) * 0.4), 1)

  const conversionRate = activeUsers > 0
    ? parseFloat(Math.min(todayOrders / (activeUsers * 10), 0.12).toFixed(4))
    : 0.05

  return {
    totalSales,
    orderCount,
    activeUsers,
    conversionRate: conversionRate || 0.05,
    salesGrowth: parseFloat(((todaySales - prevSales) / prevSales).toFixed(4)),
    orderGrowth: parseFloat(((todayOrders - prevOrders) / prevOrders).toFixed(4)),
    userGrowth: parseFloat(((activeUsers - prevUsers) / prevUsers).toFixed(4)),
    rateChange: parseFloat((Math.random() * 0.06 - 0.03).toFixed(4))
  }
}

export async function getTrendData(range: string = '24h'): Promise<TrendItem[]> {
  const latestDate = await getLatestDate()
  if (range === '24h') {
    const [rows] = await pool.execute<any[]>(
      `SELECT
        LPAD(hour, 2, '0') AS time,
        SUM(order_count) AS value
      FROM hourly_summary
      WHERE stat_date = ?
      GROUP BY hour
      ORDER BY hour ASC`,
      [latestDate]
    )
    return rows.map((r: any) => ({
      time: `${String(r.time).padStart(2, '0')}:00`,
      value: Number(r.value)
    }))
  } else {
    const [rows] = await pool.execute<any[]>(
      `SELECT
        DATE_FORMAT(stat_date, '%m/%d') AS time,
        SUM(order_count) AS value
      FROM hourly_summary
      WHERE stat_date >= DATE_SUB(?, INTERVAL 7 DAY)
      GROUP BY stat_date
      ORDER BY stat_date ASC`,
      [latestDate]
    )
    return rows.map((r: any) => ({
      time: r.time,
      value: Number(r.value)
    }))
  }
}

export async function getRankingData(region?: string): Promise<RankingItem[]> {
  let sql: string
  let params: any[] = []
  if (region) {
    sql = `SELECT category AS name, COUNT(*) AS value
      FROM orders
      WHERE region = ?
      GROUP BY category
      ORDER BY value DESC`
    params = [region]
  } else {
    sql = `SELECT category AS name, completed_orders AS value
      FROM category_summary
      WHERE completed_orders > 0
      ORDER BY value DESC`
  }
  const [rows] = await pool.execute<any[]>(sql, params)
  return rows.map((item: any, index: number) => ({
    name: item.name,
    value: Number(item.value),
    rank: index + 1
  }))
}

export async function getDistributionData(region?: string): Promise<DistributionItem[]> {
  let sql: string
  let params: any[] = []
  if (region) {
    sql = `SELECT category AS name, COUNT(*) AS value
      FROM orders
      WHERE region = ?
      GROUP BY category
      ORDER BY value DESC`
    params = [region]
  } else {
    sql = `SELECT category AS name, total_orders AS value
      FROM category_summary
      ORDER BY value DESC`
  }
  const [rows] = await pool.execute<any[]>(sql, params)
  const total = rows.reduce((sum: number, r: any) => sum + Number(r.value), 0) || 1
  return rows.map((item: any) => ({
    name: item.name,
    value: Number(item.value),
    percentage: parseFloat(((Number(item.value) / total) * 100).toFixed(1))
  }))
}

export async function getMapData(): Promise<MapItem[]> {
  const [rows] = await pool.execute<any[]>(
    `SELECT region AS name, total_orders AS value
    FROM region_summary
    ORDER BY value DESC`
  )
  return rows.map((item: any) => ({
    name: item.name,
    value: Number(item.value)
  }))
}

export async function getRegionTrendData(region: string): Promise<TrendItem[]> {
  const [rows] = await pool.execute<any[]>(
    `SELECT DATE_FORMAT(created_at, '%m/%d') AS time, COUNT(*) AS value
    FROM orders
    WHERE region = ?
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
    LIMIT 14`,
    [region]
  )
  return rows.map((r: any) => ({
    time: r.time,
    value: Number(r.value)
  }))
}

export async function getRegionRankingData(region: string): Promise<RankingItem[]> {
  const [rows] = await pool.execute<any[]>(
    `SELECT category AS name, COUNT(*) AS value
    FROM orders
    WHERE region = ?
    GROUP BY category
    ORDER BY value DESC`,
    [region]
  )
  return rows.map((item: any, index: number) => ({
    name: item.name,
    value: Number(item.value),
    rank: index + 1
  }))
}

export async function getRegionDistributionData(region: string): Promise<DistributionItem[]> {
  const [rows] = await pool.execute<any[]>(
    `SELECT category AS name, COUNT(*) AS value
    FROM orders
    WHERE region = ?
    GROUP BY category
    ORDER BY value DESC`,
    [region]
  )
  const total = rows.reduce((sum: number, r: any) => sum + Number(r.value), 0) || 1
  return rows.map((item: any) => ({
    name: item.name,
    value: Number(item.value),
    percentage: parseFloat(((Number(item.value) / total) * 100).toFixed(1))
  }))
}

export async function getTotalStats(): Promise<{ totalSales: number; totalOrders: number }> {
  const [rows] = await pool.execute<any[]>(
    `SELECT
      COALESCE(SUM(total_sales), 0) AS totalSales,
      COALESCE(SUM(total_orders), 0) AS totalOrders
    FROM daily_summary`
  )
  return {
    totalSales: Math.round(Number(rows[0].totalSales)),
    totalOrders: Number(rows[0].totalOrders)
  }
}

export default pool
