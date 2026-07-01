<script setup>
import { computed } from 'vue'
import { AREA_COLORS } from '../data'
import { startDrag } from '../canvasEngine'

const props = defineProps({
  discipline: { type: Object, required: true },
})

const areaColor = computed(() => AREA_COLORS[props.discipline.area] || AREA_COLORS.eng)

function onMousedown(e) {
  startDrag(props.discipline.code, e.currentTarget, e)
}
</script>

<template>
  <div
    class="node-card state-default"
    :id="'node-' + discipline.code"
    :style="{ '--area-color': areaColor }"
    @mousedown="onMousedown"
  >
    <div class="node-period">P{{ discipline.period }}</div>
    <div class="node-code">{{ discipline.code }}</div>
    <div class="node-name">{{ discipline.name }}</div>
    <div class="node-meta">{{ discipline.hours }}h · {{ discipline.credits }}cr</div>
  </div>
</template>
