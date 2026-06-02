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
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { DistributionItem } from '@/types/api'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const props = withDefaults(defineProps<{
  title: string
  data: DistributionItem[]
}>(), {
  data: () => []
})

const chartRef = ref()

const colors = ['#00f0ff', '#1890ff', '#7b61ff', '#00d68f', '#ff9f43', '#ff6b6b', '#fd79a8']

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
    textStyle: { color: '#e0e8f0', fontSize: 12 },
    formatter: (p: any) => `${p.name}: ${p.percent}%`
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    textStyle: { color: '#8899aa', fontSize: 11 },
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 8
  },
  series: [{
    type: 'pie',
    radius: ['35%', '60%'],
    center: ['40%', '50%'],
    avoidLabelOverlap: true,
    itemStyle: {
      borderRadius: 4,
      borderColor: '#0a1628',
      borderWidth: 2
    },
    label: {
      show: false
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#e0e8f0'
      },
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    data: props.data.map((d, i) => ({
      value: d.value,
      name: d.name,
      itemStyle: { color: colors[i % colors.length] }
    }))
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
    background: var(--accent-purple);
    margin-right: 8px;
    vertical-align: middle;
    border-radius: 2px;
  }
}
</style>
