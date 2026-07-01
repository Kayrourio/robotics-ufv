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

const wrapperRef = ref(null)
const innerRef = ref(null)
const edgeLayerRef = ref(null)
const minimapRef = ref(null)
const zoomIndicatorRef = ref(null)

let stopWatch = null

onMounted(() => {
  initCanvas({
    wrapper: wrapperRef.value,
    inner: innerRef.value,
    svg: edgeLayerRef.value.$el,
    minimap: minimapRef.value.$el,
    zoomIndicator: zoomIndicatorRef.value,
  })

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
      <edge-layer ref="edgeLayerRef"></edge-layer>
      <node-card v-for="d in DISCIPLINES" :key="d.code" :discipline="d"></node-card>
    </div>
    <mini-map ref="minimapRef"></mini-map>
    <div id="zoom-indicator" ref="zoomIndicatorRef">85%</div>
  </div>
</template>
