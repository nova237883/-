<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28">
            <rect x="2" y="2" width="10" height="10" rx="2" fill="#00f0ff" opacity="0.6"/>
            <rect x="16" y="2" width="10" height="10" rx="2" fill="#1890ff" opacity="0.6"/>
            <rect x="2" y="16" width="10" height="10" rx="2" fill="#7b61ff" opacity="0.6"/>
            <rect x="16" y="16" width="10" height="10" rx="2" fill="#00f0ff"/>
          </svg>
        </div>
        <div class="logo-text">
          <div class="logo-title">智慧数据</div>
          <div class="logo-sub">运营中心</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div
          v-for="item in menuList"
          :key="item.id"
          class="nav-item"
          :class="{ active: isActive(item.path), collapsed: item.children?.length }"
          @click="handleNavClick(item)"
        >
          <div class="nav-item-inner">
            <span class="nav-icon" v-html="getIcon(item.icon)"></span>
            <span class="nav-label">{{ item.name }}</span>
            <span v-if="item.children?.length" class="nav-arrow" :class="{ open: expandedMenus.has(item.id) }">
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
            </span>
          </div>
          <div v-if="item.children?.length && expandedMenus.has(item.id)" class="nav-children">
            <div
              v-for="child in item.children"
              :key="child.id"
              class="nav-child-item"
              :class="{ active: isActive(child.path) }"
              @click.stop="handleNavClick(child)"
            >
              <span class="nav-dot"></span>
              <span class="nav-label">{{ child.name }}</span>
            </div>
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-detail">
            <div class="user-name">{{ authStore.user?.username }}</div>
            <div class="user-role">{{ roleLabel }}</div>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="退出登录">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M7 2H3a1 1 0 00-1 1v12a1 1 0 001 1h4M11 13l4-4-4-4M15 9H7" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <div class="content-header">
        <div class="connection-status">
          <span class="status-dot"></span>
          <span>已连接</span>
        </div>
      </div>
      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePermissionStore } from '@/stores/permissionStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()

const expandedMenus = ref(new Set<number>())

const menuList = computed(() => {
  return permissionStore.menus
})

const userInitial = computed(() => {
  return authStore.user?.username?.charAt(0).toUpperCase() || 'U'
})

const roleLabel = computed(() => {
  return authStore.user?.role === 'admin' ? '管理员' : '访客'
})

function isActive(path: string): boolean {
  if (!path) return false
  return route.path === path || route.path.startsWith(path + '/')
}

function getIcon(iconName: string): string {
  const icons: Record<string, string> = {
    Monitor: '<svg width="18" height="18" viewBox="0 0 18 18"><rect x="1" y="1" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M6 16h6M9 13v3" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
    User: '<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M2 16c0-4 3-7 7-7s7 3 7 7" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
    Users: '<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="7" cy="5" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="13" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M1 16c0-3.5 2.5-6 6-6s6 2.5 6 6M11 15c0-2.5 2-4.5 4.5-4.5S20 12.5 20 15" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
    Database: '<svg width="18" height="18" viewBox="0 0 18 18"><ellipse cx="9" cy="4" rx="7" ry="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M2 4v5c0 1.4 3 2.5 7 2.5s7-1.1 7-2.5V4M2 9v5c0 1.4 3 2.5 7 2.5s7-1.1 7-2.5V9" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
    Settings: '<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
  }
  return icons[iconName] || ''
}

function handleNavClick(item: any) {
  if (item.children?.length) {
    if (expandedMenus.value.has(item.id)) {
      expandedMenus.value.delete(item.id)
    } else {
      expandedMenus.value.add(item.id)
    }
    return
  }
  if (item.path) {
    router.push(item.path)
  }
}

function handleLogout() {
  authStore.logout()
  permissionStore.clear()
  router.push('/login')
}

onMounted(() => {
  const current = route.path
  for (const menu of permissionStore.menus) {
    if (menu.children?.length) {
      for (const child of menu.children) {
        if (current.startsWith(child.path)) {
          expandedMenus.value.add(menu.id)
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  background: var(--bg-primary);
}

.sidebar {
  width: 220px;
  height: 100%;
  background: linear-gradient(180deg, rgba(16, 28, 48, 0.95), rgba(10, 22, 40, 0.98));
  border-right: 1px solid rgba(0, 240, 255, 0.1);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.08);
}

.logo-text {
  .logo-title {
    font-size: 16px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.3;
  }
  .logo-sub {
    font-size: 10px;
    color: rgba(0, 240, 255, 0.4);
    letter-spacing: 2px;
  }
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 240, 255, 0.15);
    border-radius: 2px;
  }
}

.nav-item {
  margin: 2px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 240, 255, 0.06);
  }

  &.active > .nav-item-inner {
    background: rgba(0, 240, 255, 0.1);
    color: var(--accent-cyan);
  }
}

.nav-item-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.2s;
}

.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
}

.nav-arrow {
  display: flex;
  align-items: center;
  transition: transform 0.2s;

  &.open {
    transform: rotate(90deg);
  }
}

.nav-children {
  padding: 2px 0 4px 32px;
}

.nav-child-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--accent-cyan);
    background: rgba(0, 240, 255, 0.05);
  }

  &.active {
    color: var(--accent-cyan);
    background: rgba(0, 240, 255, 0.08);
  }
}

.nav-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.sidebar-footer {
  padding: 12px 14px;
  border-top: 1px solid rgba(0, 240, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #0a1628;
}

.user-detail {
  .user-name {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 500;
  }
  .user-role {
    font-size: 11px;
    color: var(--text-secondary);
    opacity: 0.7;
  }
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--accent-red);
    background: rgba(255, 107, 107, 0.1);
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.content-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.06);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-red);
    animation: breathe 2s infinite;
  }

  &.connected .status-dot {
    background: var(--accent-green);
    animation: none;
  }
}

.content-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

@keyframes breathe {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
