import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api'
import { useAuthStore } from '@/stores/authStore'
import router from '@/router'

const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const { data } = response
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export async function getOverview(): Promise<ApiResponse<any>> {
  const res = await http.get('/dashboard/overview')
  return res.data
}

export async function getTrend(range: string = '24h'): Promise<ApiResponse<any>> {
  const res = await http.get('/dashboard/trend', { params: { range } })
  return res.data
}

export async function getRanking(region?: string): Promise<ApiResponse<any>> {
  const params: any = {}
  if (region) params.region = region
  const res = await http.get('/dashboard/ranking', { params })
  return res.data
}

export async function getDistribution(region?: string): Promise<ApiResponse<any>> {
  const params: any = {}
  if (region) params.region = region
  const res = await http.get('/dashboard/distribution', { params })
  return res.data
}

export async function getMap(): Promise<ApiResponse<any>> {
  const res = await http.get('/dashboard/map')
  return res.data
}

export async function getRegionDetail(region: string): Promise<ApiResponse<any>> {
  const res = await http.get('/dashboard/region-detail', { params: { region } })
  return res.data
}

export default http
