<template>
  <div class="chart-wrapper">
    <div class="chart-title">{{ title }}</div>
    <v-chart
      ref="chartRef"
      :option="chartOption"
      autoresize
      style="height: 100%; width: 100%;"
      @click="handleMapClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import * as echarts from 'echarts/core'
import { MapChart } from 'echarts/charts'
import { TooltipComponent, VisualMapComponent, GeoComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { MapItem } from '@/types/api'

echarts.use([MapChart, TooltipComponent, VisualMapComponent, GeoComponent, CanvasRenderer])

const emit = defineEmits<{
  regionClick: [region: string]
}>()

const cityToProvince: Record<string, string> = {
  '北京': '北京市', '上海': '上海市', '天津': '天津市', '重庆': '重庆市',
  '广州': '广东省', '深圳': '广东省', '东莞': '广东省', '佛山': '广东省', '珠海': '广东省',
  '杭州': '浙江省', '宁波': '浙江省', '温州': '浙江省', '嘉兴': '浙江省', '绍兴': '浙江省', '金华': '浙江省', '台州': '浙江省',
  '南京': '江苏省', '苏州': '江苏省', '常州': '江苏省', '南通': '江苏省', '徐州': '江苏省',
  '武汉': '湖北省',
  '成都': '四川省',
  '长沙': '湖南省',
  '西安': '陕西省',
  '郑州': '河南省',
  '青岛': '山东省', '济南': '山东省', '烟台': '山东省',
  '沈阳': '辽宁省', '大连': '辽宁省',
  '厦门': '福建省', '福州': '福建省', '泉州': '福建省',
  '合肥': '安徽省',
  '哈尔滨': '黑龙江省',
  '长春': '吉林省',
  '石家庄': '河北省',
  '昆明': '云南省',
  '南宁': '广西壮族自治区',
  '贵阳': '贵州省',
  '南昌': '江西省',
  '海口': '海南省',
  '乌鲁木齐': '新疆维吾尔自治区',
  '兰州': '甘肃省',
  '太原': '山西省',
  '惠州': '广东省', '中山': '广东省'
}

const props = withDefaults(defineProps<{
  title: string
  data: MapItem[]
  selectedRegion?: string | null
}>(), {
  data: () => [],
  selectedRegion: null
})

const chartRef = ref()
const mapLoaded = ref(false)

onMounted(async () => {
  try {
    const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
    const geojson = await res.json()
    echarts.registerMap('china', geojson)
    mapLoaded.value = true
  } catch {
    mapLoaded.value = true
  }
})

function handleMapClick(params: any) {
  if (params.name) {
    emit('regionClick', params.name)
  }
}

function aggregateByProvince(items: MapItem[]): MapItem[] {
  const map = new Map<string, number>()
  for (const item of items) {
    const provinceName = cityToProvince[item.name] || item.name
    const existing = map.get(provinceName) || 0
    map.set(provinceName, existing + item.value)
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

const chartOption = computed(() => {
  if (!mapLoaded.value) {
    return {}
  }
  const provinceData = aggregateByProvince(props.data)
  const maxValue = Math.max(...provinceData.map(d => d.value), 1)

  const selectedName = props.selectedRegion
  const dataWithSelect = provinceData.map(d => ({
    ...d,
    selected: d.name === selectedName,
    itemStyle: d.name === selectedName
      ? { areaColor: 'rgba(0, 240, 255, 0.35)', borderColor: '#00f0ff', borderWidth: 2 }
      : undefined
  }))

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 22, 40, 0.9)',
      borderColor: 'rgba(0, 240, 255, 0.3)',
      textStyle: { color: '#e0e8f0', fontSize: 12 },
      formatter: (p: any) => {
        const val = p.data?.value
        if (val != null && !isNaN(Number(val))) {
          return `${p.name}: ${Number(val).toLocaleString()}`
        }
        return `${p.name}: -`
      }
    },
    visualMap: {
      min: 0,
      max: maxValue,
      text: ['高', '低'],
      textStyle: { color: '#8899aa' },
      inRange: {
        color: ['rgba(0, 240, 255, 0.1)', 'rgba(0, 240, 255, 0.4)', '#1890ff', '#00f0ff']
      },
      calculable: true,
      left: '3%',
      bottom: '5%'
    },
    geo: {
      map: 'china',
      roam: true,
      label: {
        show: true,
        color: '#e0e8f0',
        fontSize: 9
      },
      itemStyle: {
        areaColor: 'rgba(10, 22, 40, 0.8)',
        borderColor: 'rgba(0, 240, 255, 0.3)',
        borderWidth: 1
      },
      emphasis: {
        label: { color: '#00f0ff', fontWeight: 'bold' },
        itemStyle: { areaColor: 'rgba(0, 240, 255, 0.15)' }
      }
    },
    series: [{
      type: 'map',
      map: 'china',
      geoIndex: 0,
      data: dataWithSelect,
      label: { show: true, color: '#e0e8f0', fontSize: 9 },
      emphasis: {
        label: { color: '#00f0ff' },
        itemStyle: { areaColor: 'rgba(0, 240, 255, 0.2)' }
      },
      select: {
        label: { color: '#00f0ff', fontWeight: 'bold' },
        itemStyle: { areaColor: 'rgba(0, 240, 255, 0.35)' }
      }
    }]
  }
})
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
