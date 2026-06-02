import { ref, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { WsMessage } from '@/types/api'

const CONNECT_TIMEOUT = 10000

export function useWebSocket() {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)

  function connect(url: string = '') {
    const wsUrl = url || undefined
    console.log('[WebSocket] 开始连接...', wsUrl || '同源')

    socket.value = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 8000,
      timeout: CONNECT_TIMEOUT,
      forceNew: true
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('[WebSocket] 已连接, ID:', socket.value?.id)
    })

    socket.value.on('disconnect', (reason) => {
      isConnected.value = false
      console.log('[WebSocket] 断开连接, 原因:', reason)
    })

    socket.value.on('connect_error', (err) => {
      isConnected.value = false
      console.error('[WebSocket] 连接错误:', err.message)
    })
  }

  function onMessage(callback: (msg: WsMessage) => void) {
    if (!socket.value) {
      console.warn('[WebSocket] socket 未创建，无法注册消息监听')
      return
    }
    socket.value.off('data_update')
    socket.value.on('data_update', (msg: WsMessage) => {
      console.log('[WebSocket] 收到数据推送:', msg.type, msg.timestamp)
      callback(msg)
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.removeAllListeners()
      socket.value.disconnect()
      socket.value = null
    }
    isConnected.value = false
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    connect,
    onMessage,
    disconnect
  }
}
