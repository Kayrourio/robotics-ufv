<script setup>
import { route } from '../../router'

const panels = 5
</script>

<template>
  <div class="hub-wipe" :class="route.wipe" aria-hidden="true">
    <div
      v-for="i in panels"
      :key="i"
      class="hub-wipe-panel"
      :style="{ '--wp-i': i - 1 }"
    >
      <div class="hub-wipe-line"></div>
    </div>
  </div>
</template>
