<script setup>
import { computed } from 'vue'
import { periodX } from '../data'
import { store } from '../store'
import { t } from '../i18n'

const periods = computed(() => Array.from({ length: store.maxPeriod }, (_, i) => i + 1))

function pad(p) {
  return String(p).padStart(2, '0')
}
</script>

<template>
  <div id="period-headers">
    <div
      class="period-header"
      v-for="p in periods"
      :key="p"
      :style="{ left: periodX(p) + 'px' }"
    >
      <span class="ph-num">{{ pad(p) }}</span>
      <span class="ph-label">{{ t('period').toUpperCase() }}</span>
    </div>
  </div>
</template>
