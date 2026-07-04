<script setup>
import { navigate } from '../../router'

const links = [
  { path: '/grafo', label: 'grafo' },
  { path: '/archive', label: 'archive' },
  { path: '/calendario', label: 'calendário' },
  { path: '/links', label: 'links' },
]
</script>

<template>
  <footer class="hub-footer">
    <div class="hub-wrap hub-footer-inner">
      <span class="hub-footer-brand">ROBÓTICA <span style="color: var(--hub-red)">//</span> HUB · UFV · 2026</span>
      <div class="hub-footer-links">
        <button v-for="l in links" :key="l.path" @click="navigate(l.path)">{{ l.label }}</button>
      </div>
      <a
        class="hub-footer-gh"
        href="https://github.com/ero-ufv/hub"
        target="_blank"
        rel="noopener noreferrer"
      >github.com/ero-ufv/hub ↗</a>
    </div>
  </footer>
</template>
