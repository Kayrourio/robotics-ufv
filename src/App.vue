<script setup>
import { onMounted, onUnmounted } from 'vue'
import { store } from './store'
import { zoomFit, resetLayout, applyNodeStates, deselectNode, panBy } from './canvasEngine'
import TopBar from './components/TopBar.vue'
import GraphCanvas from './components/GraphCanvas.vue'
import SidePanel from './components/SidePanel.vue'
import BottomBar from './components/BottomBar.vue'

function onKeydown(e) {
  if (e.key === 'Escape') {
    if (store.search) {
      store.search = ''
      applyNodeStates()
    } else {
      deselectNode()
    }
  }
  if (e.key === 'f' || e.key === 'F') zoomFit()
  if (e.key === 'r' || e.key === 'R') resetLayout()
  if (e.key === 'ArrowLeft') panBy(40, 0)
  if (e.key === 'ArrowRight') panBy(-40, 0)
  if (e.key === 'ArrowUp') panBy(0, 40)
  if (e.key === 'ArrowDown') panBy(0, -40)
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <top-bar></top-bar>
  <graph-canvas></graph-canvas>
  <side-panel></side-panel>
  <bottom-bar></bottom-bar>
</template>
