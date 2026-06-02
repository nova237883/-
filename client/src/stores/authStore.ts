import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<{ id: number; username: string; role: string } | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  )

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setToken(val: string) {
    token.value = val
    localStorage.setItem('token', val)
  }

  function setUser(val: { id: number; username: string; role: string }) {
    user.value = val
    localStorage.setItem('user', JSON.stringify(val))
  }

  async function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    const { usePermissionStore } = await import('@/stores/permissionStore')
    usePermissionStore().clear()
  }

  return { token, user, isLoggedIn, isAdmin, setToken, setUser, logout }
})
