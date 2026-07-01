<script setup>
import { selectNode } from '../canvasEngine'

defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <div class="blocked-list-wrap">
    <div class="blocked-list">
      <div class="panel-item" v-for="item in items" :key="item.code" @click="selectNode(item.code)">
        <span class="item-period">P{{ item.period }}</span>
        <span class="item-code">{{ item.code }}</span>
        <span class="item-name">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>
