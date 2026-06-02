<template>
  <div ref="containerRef" class="dashboard-container" v-if="isReady">
    <div class="dashboard" :style="{ transform: `scale(${scale})` }">
    <header class="dashboard-header">
      <div class="header-left">
        <div class="time-display">{{ currentTime }}</div>
      </div>
      <div class="header-center">
        <h1 class="header-title">智慧数据运营中心</h1>
        <div class="header-subtitle">SMART DATA OPERATION CENTER</div>
      </div>
      <div class="header-right">
        <div class="region-indicator" v-if="dataStore.selectedRegion">
          <span class="region-tag">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M7 1C4.24 1 2 3.24 2 6c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5zm0 7.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#00f0ff"/>
            </svg>
            <span>{{ dataStore.selectedRegion }}</span>
            <button class="clear-btn" @click="clearRegionFilter" title="清除筛选">✕</button>
          </span>
        </div>
        <div class="connection-status" :class="{ connected: isConnected }">
          <span class="status-dot"></span>
          <span>{{ isConnected ? '实时连接' : '连接中...' }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <main class="dashboard-main">
      <section class="kpi-section">
        <KpiCard
          v-if="dataStore.kpi"
          label="总销售额"
          :value="dataStore.kpi.totalSales"
          prefix="¥"
          :trend="dataStore.kpi.salesGrowth >= 0 ? 'up' : 'down'"
          :change-text="`较昨日 ${dataStore.kpi.salesGrowth >= 0 ? '+' : ''}${(dataStore.kpi.salesGrowth * 100).toFixed(1)}%`"
          sub-text="本月累计"
          :delay="0"
        />
        <KpiCard
          v-if="dataStore.kpi"
          label="订单总量"
          :value="dataStore.kpi.orderCount"
          :trend="dataStore.kpi.orderGrowth >= 0 ? 'up' : 'down'"
          :change-text="`较昨日 ${dataStore.kpi.orderGrowth >= 0 ? '+' : ''}${(dataStore.kpi.orderGrowth * 100).toFixed(1)}%`"
          sub-text="今日新增"
          :delay="100"
        />
        <KpiCard
          v-if="dataStore.kpi"
          label="活跃用户"
          :value="dataStore.kpi.activeUsers"
          :trend="dataStore.kpi.userGrowth >= 0 ? 'up' : 'down'"
          :change-text="`较昨日 ${dataStore.kpi.userGrowth >= 0 ? '+' : ''}${(dataStore.kpi.userGrowth * 100).toFixed(1)}%`"
          sub-text="当前在线"
          :delay="200"
        />
        <KpiCard
          v-if="dataStore.kpi"
          label="转化率"
          :value="dataStore.kpi.conversionRate"
          :trend="dataStore.kpi.rateChange >= 0 ? 'up' : 'down'"
          :change-text="`较昨日 ${dataStore.kpi.rateChange >= 0 ? '+' : ''}${(dataStore.kpi.rateChange * 100).toFixed(1)}%`"
          sub-text="平均转化"
          :delay="300"
        />
      </section>

      <section class="charts-section">
        <draggable
          v-model="uiStore.chartOrderTop"
          item-key="id"
          class="draggable-group"
          animation="300"
          handle=".drag-handle"
          ghost-class="dragging-ghost"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <div class="chart-cell" :class="`chart-cell-${element}`">
              <BorderBox :dragging="draggingId === element">
                <TrendChart v-if="element === 'trend'" title="实时趋势" :data="dataStore.trend" />
                <BarChart v-if="element === 'ranking'" title="销售排行" :data="dataStore.ranking" />
              </BorderBox>
            </div>
          </template>
        </draggable>
      </section>

      <section class="charts-section charts-section-bottom">
        <draggable
          v-model="uiStore.chartOrderBottom"
          item-key="id"
          class="draggable-group"
          animation="300"
          handle=".drag-handle"
          ghost-class="dragging-ghost"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <div class="chart-cell" :class="`chart-cell-${element}`">
              <BorderBox :dragging="draggingId === element">
                <PieChart v-if="element === 'pie'" title="品类分布" :data="dataStore.distribution" />
                <MapChart
                  v-if="element === 'map'"
                  title="地区分布"
                  :data="dataStore.map"
                  :selected-region="dataStore.selectedRegion"
                  @region-click="handleRegionClick"
                />
                <GaugeChart
                  v-if="element === 'gauge'"
                  title="目标达成"
                  :value="gaugeValue"
                  :max="100"
                  unit="%"
                />
              </BorderBox>
            </div>
          </template>
        </draggable>
      </section>
    </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useAutoScale } from '@/composables/useAutoScale'
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import BarChart from '@/components/BarChart.vue'
import PieChart from '@/components/PieChart.vue'
import MapChart from '@/components/MapChart.vue'
import GaugeChart from '@/components/GaugeChart.vue'
import BorderBox from '@/components/BorderBox.vue'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useWebSocket } from '@/composables/useWebSocket'
import { getOverview, getTrend, getRanking, getDistribution, getMap, getRegionDetail } from '@/utils/request'
import type { WsMessage } from '@/types/api'

const containerRef = ref<HTMLElement | null>(null)
const dataStore = useDataStore()
const uiStore = useUiStore()
const authStore = useAuthStore()
const router = useRouter()
const { isConnected, connect, onMessage } = useWebSocket()
const { scale, isReady } = useAutoScale(containerRef)

const currentTime = ref('')
let timeInterval: ReturnType<typeof setInterval> | null = null

const draggingId = ref<string | null>(null)

function onDragStart(evt: any) {
  draggingId.value = evt.item?.dataset?.id || evt.item?.getAttribute('data-id') || null
}

function onDragEnd() {
  draggingId.value = null
  const { setChartOrderTop, setChartOrderBottom } = uiStore
  setChartOrderTop(uiStore.chartOrderTop)
  setChartOrderBottom(uiStore.chartOrderBottom)
}

const gaugeValue = computed(() => {
  if (!dataStore.kpi) return 0
  return Math.min(Math.round(dataStore.kpi.conversionRate * 100), 100)
})

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

async function fetchInitialData(region?: string) {
  try {
    dataStore.setLoading(true)
    if (region) {
      const [overview, regionData] = await Promise.all([
        getOverview(),
        getRegionDetail(region)
      ])
      dataStore.setKpi(overview.data)
      dataStore.setTrend(regionData.data.trend)
      dataStore.setRanking(regionData.data.ranking)
      dataStore.setDistribution(regionData.data.distribution)
    } else {
      const [overview, trend, ranking, distribution, map] = await Promise.all([
        getOverview(),
        getTrend('24h'),
        getRanking(),
        getDistribution(),
        getMap()
      ])
      dataStore.setKpi(overview.data)
      dataStore.setTrend(trend.data)
      dataStore.setRanking(ranking.data)
      dataStore.setDistribution(distribution.data)
      dataStore.setMap(map.data)
    }
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
  } finally {
    dataStore.setLoading(false)
  }
}

function handleRegionClick(region: string) {
  const regionName = geoToRegion(region)
  if (!regionName) return
  if (dataStore.selectedRegion === regionName) {
    clearRegionFilter()
    return
  }
  dataStore.setSelectedRegion(regionName)
  fetchInitialData(regionName)
}

function clearRegionFilter() {
  dataStore.clearRegionFilter()
  fetchInitialData()
}

function handleWsMessage(msg: WsMessage) {
  if (dataStore.selectedRegion) {
    return
  }
  switch (msg.type) {
    case 'kpi_update':
      dataStore.setKpi(msg.data as any)
      break
    case 'trend_update':
      dataStore.setTrend(msg.data as any)
      break
    case 'ranking_update':
      dataStore.setRanking(msg.data as any)
      break
    case 'distribution_update':
      dataStore.setDistribution(msg.data as any)
      break
    case 'map_update':
      dataStore.setMap(msg.data as any)
      break
  }
}

function geoToRegion(geoName: string): string | null {
  const map: Record<string, string> = {
    '北京市': '北京', '天津市': '天津', '上海市': '上海', '重庆市': '重庆',
    '河北省': '石家庄', '山西省': '太原', '辽宁省': '沈阳', '吉林省': '长春',
    '黑龙江省': '哈尔滨', '江苏省': '南京', '浙江省': '杭州', '安徽省': '合肥',
    '福建省': '福州', '江西省': '南昌', '山东省': '济南', '河南省': '郑州',
    '湖北省': '武汉', '湖南省': '长沙', '广东省': '广州', '海南省': '海口',
    '四川省': '成都', '贵州省': '贵阳', '云南省': '昆明', '陕西省': '西安',
    '甘肃省': '兰州', '青海省': '西宁', '台湾省': '台北',
    '广西壮族自治区': '南宁', '内蒙古自治区': '呼和浩特', '宁夏回族自治区': '银川',
    '新疆维吾尔自治区': '乌鲁木齐', '西藏自治区': '拉萨',
    '香港特别行政区': '香港', '澳门特别行政区': '澳门'
  }
  return map[geoName] || null
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  await fetchInitialData()
  connect()
  onMessage(handleWsMessage)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(0, 240, 255, 0.03) 0%, transparent 60%),
    var(--bg-primary);
}

.dashboard {
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  padding: 0 8px 12px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 20%;
    right: 20%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent);
  }
}

.header-left {
  flex: 1;
}

.time-display {
  font-family: var(--font-number);
  font-size: 16px;
  color: var(--accent-cyan);
  letter-spacing: 1px;
}

.header-center {
  flex: 2;
  text-align: center;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 6px;
}

.header-subtitle {
  font-size: 11px;
  color: rgba(0, 240, 255, 0.4);
  letter-spacing: 4px;
  margin-top: 2px;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-red);
    animation: breathe 2s infinite;
  }

  &.connected .status-dot {
    background: var(--accent-green);
    animation: none;
  }
}

.region-indicator {
  animation: fadeInUp 0.3s ease;
}

.region-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 10px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 4px;
  font-size: 13px;
  color: var(--accent-cyan);
  white-space: nowrap;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: rgba(0, 240, 255, 0.2);
  color: var(--accent-cyan);
  border-radius: 50%;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;

  &:hover {
    background: rgba(0, 240, 255, 0.4);
    transform: scale(1.1);
  }
}

.logout-btn {
  padding: 4px 14px;
  background: transparent;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 4px;
  color: var(--accent-cyan);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 240, 255, 0.1);
    border-color: var(--accent-cyan);
  }
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
  overflow: hidden;
}

.kpi-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.charts-section {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.charts-section-bottom {
  flex: 1.2;
}

.chart-cell {
  min-height: 0;
  overflow: hidden;
}

.chart-cell-trend { flex: 3; }
.chart-cell-ranking { flex: 2; }
.chart-cell-pie { flex: 2; }
.chart-cell-map { flex: 3; }
.chart-cell-gauge { flex: 1.5; }

.draggable-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.dragging-ghost {
  opacity: 0.4;
  border: 2px dashed var(--accent-cyan);
  border-radius: 6px;
}
</style>
