import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.scss'
import { setupPermissionDirective } from './directives/permission'

const app = createApp(App)
app.use(createPinia())
app.use(router)
setupPermissionDirective(app)
app.mount('#app')
