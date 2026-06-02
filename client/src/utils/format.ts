export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

export function formatPercent(value: number, decimals: number = 2): string {
  return (value * 100).toFixed(decimals) + '%'
}

export function formatCurrency(value: number): string {
  return '¥' + formatNumber(value)
}
