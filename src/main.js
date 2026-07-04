import { createApp } from 'vue'
import './assets/main.css'
import './assets/hub.css'
import App from './App.vue'
import { vReveal } from './directives/reveal'

createApp(App).directive('reveal', vReveal).mount('#app')
