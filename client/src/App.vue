<template>
  <div class="app-container">
    <router-view />
    <div class="scan-line"></div>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss">
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  position: relative;
}

.scan-line {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.15), transparent);
  animation: scanline 8s linear infinite;
  pointer-events: none;
  z-index: 9999;
}
</style>
