import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router).mount('#app')

// Apply saved theme on load
import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore()
themeStore.init()