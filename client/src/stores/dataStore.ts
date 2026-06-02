import { defineStore } from 'pinia'
import type { KpiData, TrendItem, RankingItem, DistributionItem, MapItem } from '@/types/api'

interface DataState {
  kpi: KpiData | null
  trend: TrendItem[]
  ranking: RankingItem[]
  distribution: DistributionItem[]
  map: MapItem[]
  loading: boolean
  selectedRegion: string | null
}

export const useDataStore = defineStore('data', {
  state: (): DataState => ({
    kpi: null,
    trend: [],
    ranking: [],
    distribution: [],
    map: [],
    loading: false,
    selectedRegion: null
  }),
  actions: {
    setKpi(data: KpiData) {
      this.kpi = data
    },
    setTrend(data: TrendItem[]) {
      this.trend = data
    },
    setRanking(data: RankingItem[]) {
      this.ranking = data
    },
    setDistribution(data: DistributionItem[]) {
      this.distribution = data
    },
    setMap(data: MapItem[]) {
      this.map = data
    },
    setLoading(val: boolean) {
      this.loading = val
    },
    setSelectedRegion(region: string | null) {
      this.selectedRegion = region
    },
    clearRegionFilter() {
      this.selectedRegion = null
    }
  }
})
