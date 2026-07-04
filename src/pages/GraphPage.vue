<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { store } from '../store'
import { zoomFit, resetLayout, applyNodeStates, deselectNode, panBy } from '../canvasEngine'
import SiteNav from '../components/hub/SiteNav.vue'
import TopBar from '../components/TopBar.vue'
import GraphCanvas from '../components/GraphCanvas.vue'
import SidePanel from '../components/SidePanel.vue'
import BottomBar from '../components/BottomBar.vue'

const shellRef = ref(null)
const headerRef = ref(null)
let resizeObserver = null

function onKeydown(e) {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    if (e.key !== 'Escape') return
  }
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

// A side panel é position:fixed (relativa à viewport), então precisa saber a
// altura real do cabeçalho (SiteNav + toolbar do grafo, que varia com o menu
// mobile aberto) para não ficar por baixo dele.
function syncHeaderHeight() {
  if (!shellRef.value || !headerRef.value) return
  shellRef.value.style.setProperty('--graph-header-h', `${headerRef.value.offsetHeight}px`)
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  syncHeaderHeight()
  resizeObserver = new ResizeObserver(syncHeaderHeight)
  resizeObserver.observe(headerRef.value)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  resizeObserver && resizeObserver.disconnect()
})
</script>

<template>
  <div class="graph-shell" ref="shellRef">
    <div class="graph-header" ref="headerRef">
      <site-nav dark></site-nav>
      <top-bar></top-bar>
    </div>
    <graph-canvas></graph-canvas>
    <side-panel></side-panel>
    <bottom-bar></bottom-bar>
  </div>
</template>

<style scoped>
.graph-shell {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  position: relative;
}
.graph-shell::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #e63030;
  z-index: 200;
}
.graph-header {
  flex: 0 0 auto;
  background: var(--bg-panel);
}
</style>
