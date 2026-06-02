import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env') })

const password = 'admin123'
const hash = await bcrypt.hash(password, 10)
console.log('生成的哈希:', hash)

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dashboard_db',
})

await pool.execute(
  `INSERT INTO users (username, password_hash, role, email) VALUES (?, ?, 'admin', ?)
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
  ['admin', hash, 'admin@dashboard.com']
)

await pool.execute(
  `INSERT INTO users (username, password_hash, role, email) VALUES (?, ?, 'viewer', ?)
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
  ['viewer', hash, 'viewer@dashboard.com']
)

console.log('✅ 账号已初始化: admin / admin123')
await pool.end()
