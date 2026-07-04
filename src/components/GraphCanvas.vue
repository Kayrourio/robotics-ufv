<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { DISCIPLINES } from '../data'
import { graphUtils } from '../graphUtils'
import { store } from '../store'
import { initCanvas, unbindCanvasEvents, redrawAllEdges, applyNodeStates, updateMinimap } from '../canvasEngine'
import PeriodHeaders from './PeriodHeaders.vue'
import EdgeLayer from './EdgeLayer.vue'
import NodeCard from './NodeCard.vue'
import MiniMap from './MiniMap.vue'
import AreaLegend from './AreaLegend.vue'

const wrapperRef = ref(null)
const innerRef = ref(null)
const edgeLayerRef = ref(null)
const minimapRef = ref(null)
const zoomIndicatorRef = ref(null)
const dropTargetRef = ref(null)

// dica de "arraste para navegar" só em telas de toque estreitas, some no
// primeiro drag/scroll do usuário
const showPanHint = ref(window.matchMedia('(max-width: 700px)').matches)
function dismissPanHint() {
  showPanHint.value = false
}

let stopWatch = null

onMounted(() => {
  initCanvas({
    wrapper: wrapperRef.value,
    inner: innerRef.value,
    svg: edgeLayerRef.value.$el,
    minimap: minimapRef.value.$el,
    zoomIndicator: zoomIndicatorRef.value,
    dropTarget: dropTargetRef.value,
  })

  if (showPanHint.value) {
    wrapperRef.value.addEventListener('pointerdown', dismissPanHint, { once: true })
  }

  stopWatch = watchEffect(() => {
    if (!store.selected) {
      store.prereqSet = new Set()
      store.directDependents = new Set()
      store.transitiveDependents = new Set()
      redrawAllEdges()
      applyNodeStates()
      updateMinimap()
      return
    }
    store.prereqSet = graphUtils.getPrereqSet(store.selected, DISCIPLINES)
    store.directDependents = graphUtils.getDirectDependents(store.selected, DISCIPLINES)
    store.transitiveDependents = graphUtils.getTransitiveDependents(store.selected, DISCIPLINES)
    store.impactLevel = graphUtils.getImpactLevel(store.transitiveDependents.size)
    redrawAllEdges()
    applyNodeStates()
    updateMinimap()
  })
})

onUnmounted(() => {
  unbindCanvasEvents()
  if (stopWatch) stopWatch()
})
</script>

<template>
  <div id="canvas-wrapper" ref="wrapperRef" :class="{ 'panel-open': store.sidePanelOpen }">
    <div id="canvas-inner" ref="innerRef">
      <period-headers></period-headers>
      <div class="column-drop-target" ref="dropTargetRef"></div>
      <edge-layer ref="edgeLayerRef"></edge-layer>
      <node-card v-for="d in DISCIPLINES" :key="d.code" :discipline="d"></node-card>
    </div>
    <mini-map ref="minimapRef"></mini-map>
    <div id="zoom-indicator" ref="zoomIndicatorRef">85%</div>
    <area-legend></area-legend>
    <transition name="pan-hint-fade">
      <span v-if="showPanHint" class="pan-hint">← ARRASTE PARA NAVEGAR →</span>
    </transition>
  </div>
</template>

<style scoped>
.pan-hint {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  color: rgba(240, 240, 240, 0.35);
  background: rgba(13, 13, 13, 0.7);
  padding: 5px 12px;
  border-radius: 3px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 5;
}
.pan-hint-fade-enter-active {
  transition: opacity 300ms ease;
}
.pan-hint-fade-leave-active {
  transition: opacity 200ms ease;
}
.pan-hint-fade-enter-from,
.pan-hint-fade-leave-to {
  opacity: 0;
}
</style>
