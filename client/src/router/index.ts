import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePermissionStore } from '@/stores/permissionStore'
import type { MenuItem } from '@/types/api'

const componentMap: Record<string, () => Promise<any>> = {
  '/dashboard': () => import('@/views/Dashboard.vue'),
  '/profile': () => import('@/views/profile/index.vue'),
  '/users': () => import('@/views/userList/index.vue'),
  '/data': () => import('@/views/dataList/index.vue')
}

let dynamicRoutesAdded = false

function collectMenuPaths(menus: MenuItem[], out: MenuItem[] = []) {
  for (const m of menus) {
    if (m.path && componentMap[m.path]) {
      out.push(m)
    }
    if (m.children?.length) {
      collectMenuPaths(m.children, out)
    }
  }
  return out
}

function generateRoutes(menus: MenuItem[]): RouteRecordRaw[] {
  const items = collectMenuPaths(menus)
  return items.map(m => ({
    path: m.path,
    name: m.name,
    component: componentMap[m.path],
    meta: { title: m.name, permissionCode: m.permission_code }
  }))
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Layout',
      component: () => import('@/layout/SidebarLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (to.path === '/login') {
    if (authStore.isLoggedIn) {
      return next('/dashboard')
    }
    return next()
  }

  if (!authStore.isLoggedIn) {
    return next('/login')
  }

  const permissionStore = usePermissionStore()
  if (dynamicRoutesAdded && permissionStore.menus.length === 0) {
    dynamicRoutesAdded = false
  }

  if (!dynamicRoutesAdded) {
    try {
      const http = (await import('@/utils/request')).default
      const permissionStore = (await import('@/stores/permissionStore')).usePermissionStore()

      const [menusRes, permRes] = await Promise.all([
        http.get('/permission/menus'),
        http.get('/permission/permissions')
      ])

      const menus = menusRes.data.data || []
      const permissions = permRes.data.data || []

      permissionStore.setMenus(menus)
      permissionStore.setPermissions(permissions)

      const dynamicRoutes = generateRoutes(menus)
      for (const route of dynamicRoutes) {
        router.addRoute('Layout', route)
      }
      dynamicRoutesAdded = true

      return next(to.path === '/' ? '/dashboard' : to.fullPath)
    } catch (err) {
      console.error('[Router] 权限加载失败:', err)
      authStore.logout()
      return next('/login')
    }
  }

  if (to.matched.length === 0) {
    return next('/dashboard')
  }

  next()
})

export function resetDynamicRoutes() {
  dynamicRoutesAdded = false
}

export default router
