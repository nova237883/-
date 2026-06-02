<template>
  <div
    class="border-box"
    :class="{ 'is-dragging': dragging }"
    :style="boxStyle"
  >
    <div class="drag-handle">
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle cx="5" cy="3" r="1.2" fill="currentColor"/>
        <circle cx="9" cy="3" r="1.2" fill="currentColor"/>
        <circle cx="5" cy="7" r="1.2" fill="currentColor"/>
        <circle cx="9" cy="7" r="1.2" fill="currentColor"/>
        <circle cx="5" cy="11" r="1.2" fill="currentColor"/>
        <circle cx="9" cy="11" r="1.2" fill="currentColor"/>
      </svg>
    </div>
    <div class="border-corner tl"></div>
    <div class="border-corner tr"></div>
    <div class="border-corner bl"></div>
    <div class="border-corner br"></div>
    <div class="border-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  color?: string
  padding?: string
  dragging?: boolean
}>(), {
  color: 'rgba(0, 240, 255, 0.2)',
  padding: '4px',
  dragging: false
})

const boxStyle = computed(() => ({
  '--border-color': props.color,
  padding: props.padding
}))
</script>

<style lang="scss" scoped>
.border-box {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(10, 22, 40, 0.6);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.3s, box-shadow 0.3s;

  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    border-radius: 6px;
    background: linear-gradient(135deg, var(--border-color) 0%, transparent 30%, transparent 70%, var(--border-color) 100%);
    z-index: -1;
    opacity: 0.5;
    transition: opacity 0.3s;
  }

  &.is-dragging {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
    opacity: 0.6;

    &::before {
      opacity: 0.8;
    }

    .drag-handle {
      opacity: 1;
      color: var(--accent-cyan);
    }
  }

  &:hover .drag-handle {
    opacity: 0.6;
  }
}

.drag-handle {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 20;
  cursor: grab;
  color: rgba(0, 240, 255, 0.3);
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
  padding: 4px;
  border-radius: 4px;
  user-select: none;

  &:hover {
    color: var(--accent-cyan);
    opacity: 1;
    background: rgba(0, 240, 255, 0.08);
  }

  &:active {
    cursor: grabbing;
  }
}

.border-corner {
  position: absolute;
  width: 16px;
  height: 16px;

  &.tl {
    top: -1px;
    left: -1px;
    border-top: 2px solid var(--border-color);
    border-left: 2px solid var(--border-color);
    border-radius: 4px 0 0 0;
  }

  &.tr {
    top: -1px;
    right: -1px;
    border-top: 2px solid var(--border-color);
    border-right: 2px solid var(--border-color);
    border-radius: 0 4px 0 0;
  }

  &.bl {
    bottom: -1px;
    left: -1px;
    border-bottom: 2px solid var(--border-color);
    border-left: 2px solid var(--border-color);
    border-radius: 0 0 0 4px;
  }

  &.br {
    bottom: -1px;
    right: -1px;
    border-bottom: 2px solid var(--border-color);
    border-right: 2px solid var(--border-color);
    border-radius: 0 0 4px 0;
  }
}

.border-content {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}
</style>
