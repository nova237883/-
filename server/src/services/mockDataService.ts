import type {
  KpiData, TrendItem, RankingItem,
  DistributionItem, MapItem
} from '../types/index.js'

const regions = [
  '北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京',
  '重庆', '苏州', '天津', '长沙', '西安', '郑州', '东莞', '青岛',
  '沈阳', '宁波', '昆明', '大连', '厦门', '合肥', '佛山', '福州',
  '哈尔滨', '济南', '温州', '长春', '石家庄', '常州', '泉州', '南宁',
  '贵阳', '南昌', '太原', '烟台', '嘉兴', '南通', '金华', '珠海',
  '惠州', '徐州', '海口', '乌鲁木齐', '绍兴', '中山', '台州', '兰州'
]

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals: number = 4): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

export function generateKpiData(): KpiData {
  return {
    totalSales: random(5000000, 12000000),
    orderCount: random(8000, 25000),
    activeUsers: random(30000, 80000),
    conversionRate: randomFloat(0.03, 0.12),
    salesGrowth: randomFloat(-0.08, 0.15, 4),
    orderGrowth: randomFloat(-0.05, 0.12, 4),
    userGrowth: randomFloat(-0.03, 0.1, 4),
    rateChange: randomFloat(-0.02, 0.05, 4)
  }
}

export function generateTrendData(range: string = '24h'): TrendItem[] {
  const count = range === '24h' ? 24 : 7
  const data: TrendItem[] = []
  const now = new Date()

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now)
    if (range === '24h') {
      time.setHours(time.getHours() - i)
      data.push({
        time: `${String(time.getHours()).padStart(2, '0')}:00`,
        value: random(100, 1000)
      })
    } else {
      time.setDate(time.getDate() - i)
      data.push({
        time: `${time.getMonth() + 1}/${time.getDate()}`,
        value: random(2000, 8000)
      })
    }
  }
  return data
}

export function generateRankingData(region?: string): RankingItem[] {
  const items = ['电子产品', '服装鞋帽', '食品饮料', '家居用品', '美妆个护', '图书文具', '运动户外', '母婴用品', '汽车配件', '宠物用品']
  if (region) {
    const filtered = items.slice(0, random(4, 8))
    return filtered.map((name, i) => ({
      name,
      value: random(50, 500),
      rank: i + 1
    })).sort((a, b) => b.value - a.value).map((item, i) => ({ ...item, rank: i + 1 }))
  }
  return items.map((name, i) => ({
    name,
    value: random(500, 5000),
    rank: i + 1
  })).sort((a, b) => b.value - a.value).map((item, i) => ({ ...item, rank: i + 1 }))
}

export function generateDistributionData(region?: string): DistributionItem[] {
  const items = ['电子产品', '服装鞋帽', '食品饮料', '家居用品', '美妆个护', '图书文具']
  const total = region ? random(500, 3000) : random(8000, 20000)
  const values = items.map(() => random(region ? 50 : 500, region ? 500 : 5000))
  const sum = values.reduce((a, b) => a + b, 0)
  return items.map((name, i) => ({
    name,
    value: values[i],
    percentage: parseFloat((values[i] / sum * 100).toFixed(1))
  }))
}

export function generateMapData(): MapItem[] {
  const selected = regions.sort(() => Math.random() - 0.5).slice(0, 20)
  return selected.map(name => ({
    name,
    value: random(100, 5000)
  }))
}

export function generateUpdatedKpi(): KpiData {
  return {
    totalSales: Math.round(generateKpiData().totalSales * randomFloat(0.95, 1.05)),
    orderCount: Math.round(generateKpiData().orderCount * randomFloat(0.95, 1.05)),
    activeUsers: Math.round(generateKpiData().activeUsers * randomFloat(0.95, 1.05)),
    conversionRate: randomFloat(0.03, 0.12),
    salesGrowth: randomFloat(-0.08, 0.15),
    orderGrowth: randomFloat(-0.05, 0.12),
    userGrowth: randomFloat(-0.03, 0.1),
    rateChange: randomFloat(-0.02, 0.05)
  }
}
