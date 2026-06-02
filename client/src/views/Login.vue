<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">智慧数据运营中心</h1>
        <p class="login-subtitle">SMART DATA OPERATION CENTER</p>
      </div>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        <div class="form-error" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading">登录中...</span>
          <span v-else>登 录</span>
        </button>
      </form>
      <div class="login-footer">
        <span>默认账号: admin / admin123</span>
      </div>
    </div>
    <div class="scan-line"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import http from '@/utils/request'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  try {
    const res = await http.post('/auth/login', {
      username: username.value.trim(),
      password: password.value
    })
    const data = res.data
    if (data.code === 0) {
      authStore.setToken(data.data.token)
      authStore.setUser(data.data.user)
      router.replace('/')
    } else {
      errorMsg.value = data.message || '登录失败'
    }
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || err.message || '登录失败，请检查网络连接'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(0, 240, 255, 0.05) 0%, transparent 60%),
    var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.login-container {
  width: 420px;
  padding: 48px 40px 36px;
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.95), rgba(10, 22, 40, 0.95));
  border: 1px solid var(--border-color);
  border-radius: 12px;
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(0, 240, 255, 0.3), transparent 40%, transparent 60%, rgba(0, 240, 255, 0.1));
    z-index: -1;
    opacity: 0.5;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 4px;
}

.login-subtitle {
  font-size: 11px;
  color: rgba(0, 240, 255, 0.4);
  letter-spacing: 3px;
  margin-top: 6px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  background: rgba(10, 22, 40, 0.8);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 8px rgba(0, 240, 255, 0.15);
  }

  &::placeholder {
    color: rgba(136, 153, 170, 0.5);
  }
}

.form-error {
  color: var(--accent-red);
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.login-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  color: #0a1628;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 4px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 12px;
  color: rgba(136, 153, 170, 0.5);
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

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
</style>
