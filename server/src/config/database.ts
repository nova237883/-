import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env') })

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dashboard_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

export const serverConfig = {
  port: parseInt(process.env.SERVER_PORT || '3001', 10),
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
}
