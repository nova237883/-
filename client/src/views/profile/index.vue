<template>
  <div class="profile-page">
    <div class="page-header">
      <h2 class="page-title">个人信息</h2>
    </div>
    <div class="profile-card" v-if="profile">
      <div class="profile-avatar">
        <div class="avatar-circle">{{ initial }}</div>
        <div class="avatar-name">{{ profile.username }}</div>
        <div class="avatar-role">{{ profile.role === 'admin' ? '管理员' : '访客' }}</div>
      </div>
      <div class="profile-info">
        <div class="info-row">
          <span class="info-label">用户名</span>
          <span class="info-value">{{ profile.username }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">角色</span>
          <span class="info-value">
            <span class="role-tag" :class="profile.role">{{ profile.role === 'admin' ? '管理员' : '访客' }}</span>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">邮箱</span>
          <span class="info-value">{{ profile.email || '未设置' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">创建时间</span>
          <span class="info-value">{{ formatTime(profile.created_at) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">最后登录</span>
          <span class="info-value">{{ profile.last_login ? formatTime(profile.last_login) : '首次登录' }}</span>
        </div>
      </div>
    </div>
    <div v-else class="loading-state">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import http from '@/utils/request'
import type { UserInfo } from '@/types/api'

const authStore = useAuthStore()
const profile = ref<UserInfo | null>(null)

const initial = computed(() => {
  return authStore.user?.username?.charAt(0).toUpperCase() || 'U'
})

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    const res = await http.get('/user/profile')
    profile.value = res.data.data
  } catch (err) {
    console.error('Failed to load profile:', err)
  }
})
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 24px;
  height: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1px;

  &::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 18px;
    background: var(--accent-cyan);
    margin-right: 10px;
    vertical-align: middle;
    border-radius: 2px;
  }
}

.profile-card {
  display: flex;
  gap: 40px;
  padding: 32px;
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.8), rgba(10, 22, 40, 0.8));
  border: 1px solid var(--border-color);
  border-radius: 12px;
  max-width: 700px;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue), var(--accent-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #0a1628;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
}

.avatar-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.avatar-role {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.7;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 240, 255, 0.06);
}

.info-label {
  width: 80px;
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
}

.role-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;

  &.admin {
    background: rgba(0, 240, 255, 0.1);
    color: var(--accent-cyan);
    border: 1px solid rgba(0, 240, 255, 0.3);
  }

  &.viewer {
    background: rgba(136, 153, 170, 0.1);
    color: var(--text-secondary);
    border: 1px solid rgba(136, 153, 170, 0.3);
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
