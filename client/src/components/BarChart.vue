<template>
  <div class="chart-wrapper">
    <div class="chart-title">{{ title }}</div>
    <v-chart ref="chartRef" :option="chartOption" autoresize style="height: 100%; width: 100%;" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { RankingItem } from '@/types/api'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = withDefaults(defineProps<{
  title: string
  data: RankingItem[]
}>(), {
  data: () => []
})

const chartRef = ref()

const chartOption = computed(() => ({
  grid: {
    left: '3%',
    right: '8%',
    bottom: '5%',
    top: '15%',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
    textStyle: { color: '#e0e8f0', fontSize: 12 }
  },
  xAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.08)', type: 'dashed' } },
    axisLabel: { color: '#8899aa', fontSize: 10 }
  },
  yAxis: {
    type: 'category',
    data: props.data.map(d => d.name).reverse(),
    axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.15)' } },
    axisLabel: { color: '#e0e8f0', fontSize: 11 }
  },
  series: [{
    type: 'bar',
    data: props.data.map(d => d.value).reverse(),
    barWidth: 18,
    itemStyle: {
      borderRadius: [0, 4, 4, 0],
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [
          { offset: 0, color: '#1890ff' },
          { offset: 1, color: '#00f0ff' }
        ]
      }
    },
    label: {
      show: true,
      position: 'right',
      color: '#8899aa',
      fontSize: 11,
      formatter: (p: any) => p.value.toLocaleString()
    }
  }]
}))
</script>

<style lang="scss" scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-title {
  position: absolute;
  top: 12px;
  left: 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  z-index: 10;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 14px;
    background: var(--accent-blue);
    margin-right: 8px;
    vertical-align: middle;
    border-radius: 2px;
  }
}
</style>
