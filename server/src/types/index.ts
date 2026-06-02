export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export interface KpiData {
  totalSales: number
  orderCount: number
  activeUsers: number
  conversionRate: number
  salesGrowth: number
  orderGrowth: number
  userGrowth: number
  rateChange: number
}

export interface TrendItem {
  time: string
  value: number
  category?: string
}

export interface RankingItem {
  name: string
  value: number
  rank: number
}

export interface DistributionItem {
  name: string
  value: number
  percentage: number
}

export interface MapItem {
  name: string
  value: number
  longitude?: number
  latitude?: number
}

export interface WsMessage {
  type: 'kpi_update' | 'trend_update' | 'ranking_update' | 'distribution_update' | 'map_update' | 'heartbeat'
  data: unknown
  timestamp: number
}

// ====== 权限相关类型 ======

export interface MenuItem {
  id: number
  name: string
  path: string
  icon: string
  component: string
  parent_id: number
  sort_order: number
  type: 'menu' | 'button'
  permission_code: string
  visible: number
  children?: MenuItem[]
}

export interface UserInfo {
  id: number
  username: string
  role: string
  email: string | null
  created_at: string
  last_login: string | null
}

export interface AuthUser {
  id: number
  username: string
  role: string
}
