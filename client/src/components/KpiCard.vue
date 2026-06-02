<template>
  <div class="kpi-card" :style="{ animationDelay: `${delay}ms` }">
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-value number-font">
      <span class="kpi-prefix" v-if="prefix">{{ prefix }}</span>
      <span ref="valueEl">{{ displayValue }}</span>
    </div>
    <div class="kpi-footer">
      <span class="kpi-change" :class="trend">
        <svg v-if="trend === 'up'" width="12" height="12" viewBox="0 0 12 12">
          <path d="M6 2L10 8H2Z" fill="#00d68f"/>
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 12 12">
          <path d="M6 10L2 4H10Z" fill="#ff6b6b"/>
        </svg>
        {{ changeText }}
      </span>
      <span class="kpi-sub">{{ subText }}</span>
    </div>
    <div class="kpi-glow"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { formatNumber } from '@/utils/format'

const props = withDefaults(defineProps<{
  label: string
  value: number
  prefix?: string
  trend?: 'up' | 'down'
  changeText?: string
  subText?: string
  delay?: number
}>(), {
  prefix: '',
  trend: 'up',
  changeText: '',
  subText: '',
  delay: 0
})

const valueEl = ref<HTMLElement | null>(null)
const displayValue = ref(props.prefix === '¥' ? formatNumber(props.value) : formatNumber(props.value))
const prevValue = ref(props.value)

onMounted(() => {
  prevValue.value = props.value
  animateValue(0, props.value, 1500)
})

watch(() => props.value, (newVal) => {
  const start = prevValue.value
  prevValue.value = newVal
  animateValue(start, newVal, 1000)
})

function animateValue(start: number, end: number, duration: number) {
  const startTime = performance.now()
  function update(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = start + (end - start) * eased
    displayValue.value = props.prefix === '¥' ? formatNumber(current) : formatNumber(Math.round(current))
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  requestAnimationFrame(update)
}
</script>

<style lang="scss" scoped>
.kpi-card {
  position: relative;
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.9), rgba(10, 22, 40, 0.9));
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px 24px;
  animation: fadeInUp 0.6s ease both;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--border-glow);
    .kpi-glow {
      opacity: 1;
    }
  }
}

.kpi-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.05), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.kpi-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent-cyan);
  letter-spacing: 1px;
  line-height: 1.2;
}

.kpi-prefix {
  font-size: 20px;
  margin-right: 2px;
  color: var(--accent-cyan);
}

.kpi-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.kpi-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;

  &.up {
    color: var(--accent-green);
  }

  &.down {
    color: var(--accent-red);
  }
}

.kpi-sub {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
