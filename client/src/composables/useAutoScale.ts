import { ref, onMounted, onUnmounted, type Ref } from 'vue'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

export function useAutoScale(containerRef?: Ref<HTMLElement | null>) {
  const scale = ref(1)
  const isReady = ref(false)
  let observer: ResizeObserver | null = null
  let resizeTimer: ReturnType<typeof setTimeout> | null = null

  function calculateScale(width: number, height: number) {
    const scaleX = width / DESIGN_WIDTH
    const scaleY = height / DESIGN_HEIGHT
    scale.value = Math.min(scaleX, scaleY)
  }

  function handleResize() {
    if (resizeTimer) return
    resizeTimer = setTimeout(() => {
      resizeTimer = null
      if (containerRef?.value) {
        const rect = containerRef.value.getBoundingClientRect()
        calculateScale(rect.width, rect.height)
      } else {
        calculateScale(window.innerWidth, window.innerHeight)
      }
    }, 16)
  }

  onMounted(() => {
    if (containerRef?.value) {
      observer = new ResizeObserver(() => {
        handleResize()
      })
      observer.observe(containerRef.value)
      const rect = containerRef.value.getBoundingClientRect()
      calculateScale(rect.width, rect.height)
    } else {
      calculateScale(window.innerWidth, window.innerHeight)
      window.addEventListener('resize', handleResize)
    }
    isReady.value = true
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    window.removeEventListener('resize', handleResize)
    if (resizeTimer) {
      clearTimeout(resizeTimer)
      resizeTimer = null
    }
  })

  return {
    scale,
    isReady
  }
}
