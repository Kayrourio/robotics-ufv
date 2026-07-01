<script setup>
import { COLUMNS } from '../data'
import { t } from '../i18n'
</script>

<template>
  <div id="period-headers">
    <div
      class="period-header"
      v-for="(col, p) in COLUMNS"
      :key="p"
      :style="{ left: col.x + 'px' }"
    >
      {{ t('period').toUpperCase() }} {{ p }}
    </div>
  </div>
</template>
