<script setup>
import { computed } from 'vue'
import { store } from '../store'
import { t } from '../i18n'
import { DISCIPLINE_MAP } from '../data'
import { deselectNode } from '../canvasEngine'
import PrereqList from './PrereqList.vue'
import BlockedList from './BlockedList.vue'

const discipline = computed(() => (store.selected ? DISCIPLINE_MAP[store.selected] : null))

const prereqItems = computed(() => {
  if (!discipline.value) return []
  return [
    ...discipline.value.prereqs.map((c) => ({ ...DISCIPLINE_MAP[c], isCoreq: false })),
    ...discipline.value.coreqs.map((c) => ({ ...DISCIPLINE_MAP[c], isCoreq: true })),
  ]
})

const blockedItems = computed(() => {
  if (!discipline.value) return []
  return [...store.transitiveDependents].map((c) => DISCIPLINE_MAP[c]).sort((a, b) => a.period - b.period)
})

const impactLabel = computed(() => {
  if (store.impactLevel === 'high') return t('impactHigh')
  if (store.impactLevel === 'med') return t('impactMed')
  return t('impactLow')
})
</script>

<template>
  <div id="side-panel" :class="{ open: store.sidePanelOpen }">
    <button class="close-btn" @click="deselectNode">✕</button>
    <template v-if="discipline">
      <span class="panel-badge">P{{ discipline.period }}</span>
      <div class="panel-code">{{ discipline.code }}</div>
      <div class="panel-name">{{ discipline.name }}</div>
      <div class="panel-meta">{{ discipline.hours }}{{ t('hours') }} · {{ discipline.credits }} {{ t('credits') }}</div>

      <div class="impact-banner" :class="store.impactLevel">
        ⚑ {{ impactLabel.toUpperCase() }} — {{ store.transitiveDependents.size }} {{ t('bloqueadas').toUpperCase() }}
      </div>

      <div class="panel-section-title">{{ t('prereqs') }}</div>
      <prereq-list :items="prereqItems"></prereq-list>

      <div class="panel-section-title">{{ t('blocked') }}</div>
      <blocked-list :items="blockedItems"></blocked-list>

      <div class="esc-hint">{{ t('escHint') }}</div>
    </template>
    <template v-else>
      <div class="empty-state">{{ t('noSelection') }}</div>
    </template>
  </div>
</template>
