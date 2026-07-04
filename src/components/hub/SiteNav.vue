<script setup>
import { ref } from 'vue'
import { route, navigate } from '../../router'

defineProps({
  dark: { type: Boolean, default: false },
})

const open = ref(false)

const links = [
  { path: '/grafo', label: 'Grafo' },
  { path: '/archive', label: 'Archive' },
  { path: '/calendario', label: 'Calendário' },
  { path: '/links', label: 'Links' },
]

function go(path) {
  open.value = false
  navigate(path)
}
</script>

<template>
  <nav class="hub-nav" :class="{ 'on-dark': dark }">
    <div class="hub-wrap hub-nav-inner">
      <button class="hub-nav-brand" @click="go('/')">
        ROBÓTICA <span class="slash">//</span> HUB
      </button>
      <div class="hub-nav-links">
        <button
          v-for="l in links"
          :key="l.path"
          class="hub-nav-link"
          :class="{ active: route.path === l.path }"
          @click="go(l.path)"
        >
          {{ l.label }}
        </button>
      </div>
      <button class="hub-nav-burger" @click="open = !open" aria-label="Menu">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="0" y1="1" x2="16" y2="1" />
          <line x1="0" y1="6" x2="16" y2="6" />
          <line x1="0" y1="11" x2="16" y2="11" />
        </svg>
      </button>
    </div>
  </nav>
  <div class="hub-nav-mobile" :class="{ open, 'on-dark': dark }">
    <button
      v-for="l in links"
      :key="l.path"
      class="hub-nav-link"
      :class="{ active: route.path === l.path }"
      @click="go(l.path)"
    >
      {{ l.label }}
    </button>
  </div>
</template>
