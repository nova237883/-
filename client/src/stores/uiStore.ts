import { defineStore } from 'pinia'

interface UiState {
  theme: 'dark' | 'light'
  sidebarCollapsed: boolean
  currentTime: string
  chartOrderTop: string[]
  chartOrderBottom: string[]
}

const STORAGE_KEY_TOP = 'chart_order_top'
const STORAGE_KEY_BOTTOM = 'chart_order_bottom'

function loadOrder(key: string, defaults: string[]): string[] {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaults
  } catch {
    return defaults
  }
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    theme: 'dark',
    sidebarCollapsed: false,
    currentTime: '',
    chartOrderTop: loadOrder(STORAGE_KEY_TOP, ['trend', 'ranking']),
    chartOrderBottom: loadOrder(STORAGE_KEY_BOTTOM, ['pie', 'map', 'gauge'])
  }),
  getters: {
    topPanels: (state) => state.chartOrderTop,
    bottomPanels: (state) => state.chartOrderBottom
  },
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
    },
    setCurrentTime(time: string) {
      this.currentTime = time
    },
    setChartOrderTop(order: string[]) {
      this.chartOrderTop = order
      localStorage.setItem(STORAGE_KEY_TOP, JSON.stringify(order))
    },
    setChartOrderBottom(order: string[]) {
      this.chartOrderBottom = order
      localStorage.setItem(STORAGE_KEY_BOTTOM, JSON.stringify(order))
    },
    resetChartOrder() {
      this.setChartOrderTop(['trend', 'ranking'])
      this.setChartOrderBottom(['pie', 'map', 'gauge'])
    }
  }
})
