import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost', port: 3306, user: 'root',
  password: '237883', database: 'dashboard_db',
  waitForConnections: true, connectionLimit: 2
})

const sql = `
CREATE TRIGGER after_order_insert AFTER INSERT ON orders FOR EACH ROW
BEGIN
  INSERT INTO daily_summary (stat_date, total_orders, total_sales, completed_orders, pending_orders, cancelled_orders)
  VALUES (DATE(NEW.created_at), 1, NEW.amount,
    CASE WHEN NEW.status='completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status='pending' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status='cancelled' THEN 1 ELSE 0 END)
  ON DUPLICATE KEY UPDATE total_orders=total_orders+1, total_sales=total_sales+NEW.amount,
    completed_orders=completed_orders+(CASE WHEN NEW.status='completed' THEN 1 ELSE 0 END),
    pending_orders=pending_orders+(CASE WHEN NEW.status='pending' THEN 1 ELSE 0 END),
    cancelled_orders=cancelled_orders+(CASE WHEN NEW.status='cancelled' THEN 1 ELSE 0 END);
  INSERT INTO region_summary (region, total_orders, total_sales)
  VALUES (NEW.region, 1, NEW.amount)
  ON DUPLICATE KEY UPDATE total_orders=total_orders+1, total_sales=total_sales+NEW.amount;
  INSERT INTO category_summary (category, total_orders, total_sales, completed_orders)
  VALUES (NEW.category, 1, NEW.amount, CASE WHEN NEW.status='completed' THEN 1 ELSE 0 END)
  ON DUPLICATE KEY UPDATE total_orders=total_orders+1, total_sales=total_sales+NEW.amount,
    completed_orders=completed_orders+(CASE WHEN NEW.status='completed' THEN 1 ELSE 0 END);
  INSERT INTO hourly_summary (stat_date, hour, order_count)
  VALUES (DATE(NEW.created_at), HOUR(NEW.created_at), 1)
  ON DUPLICATE KEY UPDATE order_count=order_count+1;
END
`

async function main() {
  await pool.query('DROP TRIGGER IF EXISTS after_order_insert')
  await pool.query(sql)
  console.log('[OK] 触发器已创建')
  await pool.end()
}

main().catch(console.error)
