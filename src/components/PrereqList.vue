<script setup>
import { t } from '../i18n'
import { selectNode } from '../canvasEngine'

defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <div>
    <div
      class="panel-item"
      :class="{ coreq: item.isCoreq }"
      v-for="item in items"
      :key="item.code"
      @click="selectNode(item.code)"
    >
      <span class="tag">{{ item.isCoreq ? t('tagCo') : t('tagPre') }}</span>
      <span class="item-code">{{ item.code }}</span>
      <span class="item-name">{{ item.name }}</span>
    </div>
  </div>
</template>
