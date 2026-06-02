import type { App } from 'vue'
import { usePermissionStore } from '@/stores/permissionStore'

export function setupPermissionDirective(app: App) {
  app.directive('permission', {
    mounted(el, binding) {
      const store = usePermissionStore()
      const value = binding.value
      if (!value) return

      const hasPerm = store.hasPermission(value)
      if (!hasPerm) {
        el.parentNode?.removeChild(el)
      }
    }
  })
}
