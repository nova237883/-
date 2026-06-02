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
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { TrendItem } from '@/types/api'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = withDefaults(defineProps<{
  title: string
  data: TrendItem[]
}>(), {
  data: () => []
})

const chartRef = ref()

const chartOption = computed(() => ({
  grid: {
    left: '3%',
    right: '4%',
    bottom: '8%',
    top: '15%',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
    textStyle: { color: '#e0e8f0', fontSize: 12 }
  },
  xAxis: {
    type: 'category',
    data: props.data.map(d => d.time),
    boundaryGap: false,
    axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.15)' } },
    axisLabel: { color: '#8899aa', fontSize: 10 },
    splitLine: { show: false }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.08)', type: 'dashed' } },
    axisLabel: { color: '#8899aa', fontSize: 10 }
  },
  series: [{
    type: 'line',
    smooth: true,
    sampling: 'lttb',
    data: props.data.map(d => d.value),
    symbol: 'none',
    lineStyle: {
      width: 2,
      color: '#00f0ff'
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(0, 240, 255, 0.3)' },
          { offset: 1, color: 'rgba(0, 240, 255, 0.02)' }
        ]
      }
    },
    markPoint: {
      data: [
        { type: 'max', name: '最大值' },
        { type: 'min', name: '最小值' }
      ],
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: '#00f0ff' }
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
    background: var(--accent-cyan);
    margin-right: 8px;
    vertical-align: middle;
    border-radius: 2px;
  }
}
</style>
