<script setup>
import { computed } from 'vue'
import { route } from './router'
import HomePage from './pages/HomePage.vue'
import ArchivePage from './pages/ArchivePage.vue'
import CalendarPage from './pages/CalendarPage.vue'
import LinksPage from './pages/LinksPage.vue'
import GraphPage from './pages/GraphPage.vue'
import PageWipe from './components/hub/PageWipe.vue'
import CursorFX from './components/hub/CursorFX.vue'

const pages = {
  '/': HomePage,
  '/archive': ArchivePage,
  '/calendario': CalendarPage,
  '/links': LinksPage,
  '/grafo': GraphPage,
}

const page = computed(() => pages[route.path] || HomePage)
</script>

<template>
  <component :is="page" :key="route.path" />
  <page-wipe></page-wipe>
  <cursor-f-x></cursor-f-x>
</template>
