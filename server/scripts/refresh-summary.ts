import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '237883',
  database: process.env.DB_NAME || 'dashboard_db',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
})

async function main() {
  console.log('开始填充汇总表...')

  // 刷新日汇总
  await pool.execute(`
    INSERT INTO daily_summary (stat_date, total_orders, total_sales, completed_orders, pending_orders, cancelled_orders)
    SELECT
      DATE(created_at) AS stat_date,
      COUNT(*) AS total_orders,
      COALESCE(SUM(amount), 0) AS total_sales,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders
    FROM orders
    GROUP BY DATE(created_at)
    ON DUPLICATE KEY UPDATE
      total_orders = VALUES(total_orders),
      total_sales = VALUES(total_sales),
      completed_orders = VALUES(completed_orders),
      pending_orders = VALUES(pending_orders),
      cancelled_orders = VALUES(cancelled_orders)
  `)
  console.log('  [OK] daily_summary')

  // 刷新地区汇总
  await pool.execute(`
    INSERT INTO region_summary (region, total_orders, total_sales)
    SELECT region, COUNT(*) AS total_orders, COALESCE(SUM(amount), 0) AS total_sales
    FROM orders
    GROUP BY region
    ON DUPLICATE KEY UPDATE
      total_orders = VALUES(total_orders),
      total_sales = VALUES(total_sales)
  `)
  console.log('  [OK] region_summary')

  // 刷新品类汇总
  await pool.execute(`
    INSERT INTO category_summary (category, total_orders, total_sales, completed_orders)
    SELECT
      category,
      COUNT(*) AS total_orders,
      COALESCE(SUM(amount), 0) AS total_sales,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders
    FROM orders
    GROUP BY category
    ON DUPLICATE KEY UPDATE
      total_orders = VALUES(total_orders),
      total_sales = VALUES(total_sales),
      completed_orders = VALUES(completed_orders)
  `)
  console.log('  [OK] category_summary')

  // 刷新小时级趋势
  await pool.execute(`
    INSERT INTO hourly_summary (stat_date, hour, order_count)
    SELECT DATE(created_at) AS stat_date, HOUR(created_at) AS hour, COUNT(*) AS order_count
    FROM orders
    GROUP BY DATE(created_at), HOUR(created_at)
    ON DUPLICATE KEY UPDATE
      order_count = VALUES(order_count)
  `)
  console.log('  [OK] hourly_summary')

  // 创建触发器（用 Node.js 避免 SQL 编码问题）
  const triggerExists = await pool.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.triggers WHERE trigger_name = 'after_order_insert' AND trigger_schema = ?`,
    ['dashboard_db']
  )

  console.log('  [OK] 汇总表全部填充完毕!')

  // 验证数据
  const [d] = await pool.execute('SELECT COUNT(*) AS cnt FROM daily_summary')
  const [r] = await pool.execute('SELECT COUNT(*) AS cnt FROM region_summary')
  const [c] = await pool.execute('SELECT COUNT(*) AS cnt FROM category_summary')
  const [h] = await pool.execute('SELECT COUNT(*) AS cnt FROM hourly_summary')

  console.log(`\n汇总表统计:`)
  console.log(`  daily_summary:    ${d[0].cnt} 行`)
  console.log(`  region_summary:   ${r[0].cnt} 行`)
  console.log(`  category_summary: ${c[0].cnt} 行`)
  console.log(`  hourly_summary:   ${h[0].cnt} 行`)

  await pool.end()
}

main().catch(console.error)
