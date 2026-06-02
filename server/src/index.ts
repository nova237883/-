import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dashboardRoutes from './routes/dashboard.js'
import authRoutes from './routes/auth.js'
import permissionRoutes from './routes/permission.js'
import userRoutes from './routes/user.js'
import { serverConfig } from './config/database.js'
import { getKpiData, getTrendData, getRankingData, getDistributionData, getMapData } from './services/dataService.js'
import type { WsMessage } from './types/index.js'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: serverConfig.cors.origin,
    methods: ['GET', 'POST']
  },
  pingInterval: 25000,
  pingTimeout: 20000
})

app.use(cors({ origin: serverConfig.cors.origin }))
app.use(express.json())

app.use('/api/dashboard', dashboardRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/permission', permissionRoutes)
app.use('/api/user', userRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

process.on('uncaughtException', (err) => {
  console.error('[进程] 未捕获异常:', err)
})
process.on('unhandledRejection', (reason) => {
  console.error('[进程] 未处理的Promise拒绝:', reason)
})

io.on('connection', (socket) => {
  console.log('[WebSocket] 客户端已连接:', socket.id)

  const interval = setInterval(async () => {
    try {
      const [kpi, trend, ranking, distribution, mapData] = await Promise.all([
        getKpiData(),
        getTrendData('24h'),
        getRankingData(),
        getDistributionData(),
        getMapData()
      ])

      const now = Date.now()
      socket.emit('data_update', { type: 'kpi_update', data: kpi, timestamp: now })
      socket.emit('data_update', { type: 'trend_update', data: trend, timestamp: now })
      socket.emit('data_update', { type: 'ranking_update', data: ranking, timestamp: now })
      socket.emit('data_update', { type: 'distribution_update', data: distribution, timestamp: now })
      socket.emit('data_update', { type: 'map_update', data: mapData, timestamp: now })
      console.log('[WebSocket] 已推送全部数据到', socket.id, 'at', new Date().toLocaleTimeString())
    } catch (err) {
      console.error('[WebSocket] 数据获取错误:', err)
    }
  }, 5000)

  const heartbeat = setInterval(() => {
    socket.emit('data_update', {
      type: 'heartbeat',
      data: null,
      timestamp: Date.now()
    } as WsMessage)
  }, 10000)

  socket.on('disconnect', (reason) => {
    console.log('[WebSocket] 客户端断开:', socket.id, '原因:', reason)
    clearInterval(interval)
    clearInterval(heartbeat)
  })
})

httpServer.listen(serverConfig.port, () => {
  console.log(`🚀 Dashboard server running at http://localhost:${serverConfig.port}`)
  console.log(`📡 WebSocket server ready for connections`)
})

export default app
