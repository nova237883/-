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
import { GaugeChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([GaugeChart, TooltipComponent, CanvasRenderer])

const props = withDefaults(defineProps<{
  title: string
  value: number
  max?: number
  unit?: string
}>(), {
  value: 0,
  max: 100,
  unit: '%'
})

const chartRef = ref()

const chartOption = computed(() => ({
  series: [{
    type: 'gauge',
    startAngle: 220,
    endAngle: -40,
    min: 0,
    max: props.max,
    progress: {
      show: true,
      width: 12,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#00f0ff' },
            { offset: 1, color: '#1890ff' }
          ]
        }
      }
    },
    axisLine: {
      lineStyle: {
        width: 12,
        color: [[1, 'rgba(0, 240, 255, 0.1)']]
      }
    },
    axisTick: { show: false },
    splitLine: {
      length: 8,
      lineStyle: { width: 2, color: 'rgba(0, 240, 255, 0.3)' }
    },
    axisLabel: {
      color: '#8899aa',
      fontSize: 10,
      distance: 20
    },
    pointer: {
      width: 4,
      length: '60%',
      itemStyle: { color: '#00f0ff' }
    },
    detail: {
      valueAnimation: true,
      formatter: `{value}${props.unit}`,
      color: '#00f0ff',
      fontSize: 24,
      fontFamily: 'DIN, Roboto Mono, monospace',
      offsetCenter: [0, '40%']
    },
    data: [{ value: props.value }]
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
    background: var(--accent-green);
    margin-right: 8px;
    vertical-align: middle;
    border-radius: 2px;
  }
}
</style>
