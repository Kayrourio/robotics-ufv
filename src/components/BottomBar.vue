<script setup>
import { computed } from 'vue'
import { store } from '../store'
import { t } from '../i18n'
import { DISCIPLINES } from '../data'

const status = computed(() => {
  if (!store.selected) return t('statusNone')
  return t('statusSelected', {
    code: store.selected,
    n: store.transitiveDependents.size,
    m: store.prereqSet.size,
  })
})

const footer = computed(() => {
  const periods = new Set(DISCIPLINES.map((d) => d.period)).size
  return `${DISCIPLINES.length} ` + t('footer', { p: periods })
})
</script>

<template>
  <div id="bottom-bar">
    <span>{{ status }}</span>
    <span>{{ footer }}</span>
  </div>
</template>
