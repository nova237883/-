import { defineStore } from 'pinia'
import type { MenuItem } from '@/types/api'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    menus: [] as MenuItem[],
    permissions: [] as string[]
  }),
  getters: {
    hasPermission: (state) => {
      return (code: string) => state.permissions.includes(code)
    },
    hasAnyPermission: (state) => {
      return (codes: string[]) => codes.some(code => state.permissions.includes(code))
    }
  },
  actions: {
    setMenus(menus: MenuItem[]) {
      this.menus = menus
    },
    setPermissions(permissions: string[]) {
      this.permissions = permissions
    },
    clear() {
      this.menus = []
      this.permissions = []
    }
  }
})
