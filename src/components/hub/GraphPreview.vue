<script setup>
import { computed } from 'vue'
import { DISCIPLINE_MAP, EDGES } from '../../data'
import { navigate } from '../../router'

// Preview estático: um nó central com seus pré-requisitos diretos à
// esquerda e dependentes diretos à direita — recorte real do grafo.
const FOCUS = 'ELT231'

const prereqs = computed(() =>
  EDGES.filter((e) => e.to === FOCUS && !e.coreq).map((e) => e.from),
)
const dependents = computed(() =>
  EDGES.filter((e) => e.from === FOCUS && !e.coreq).map((e) => e.to).slice(0, 2),
)

const boxW = 92
const boxH = 34
const midY = 150

const leftNodes = computed(() =>
  prereqs.value.map((code, i) => ({
    code,
    x: 64,
    y: 72 + i * 150,
  })),
)
const rightNodes = computed(() =>
  dependents.value.map((code, i) => ({
    code,
    x: 460,
    y: 63 + i * 140,
  })),
)

function edgePath(sx, sy, tx, ty) {
  return `M ${sx} ${sy} C ${(sx + tx) / 2} ${sy}, ${(sx + tx) / 2} ${ty}, ${tx} ${ty}`
}
</script>

<template>
  <div class="hub-graph-preview">
    <svg viewBox="0 0 560 340" class="hub-graph-preview-svg">
      <g stroke="rgba(255,255,255,0.18)" stroke-width="1" fill="none">
        <path
          v-for="n in leftNodes"
          :key="'el-' + n.code"
          :d="edgePath(n.x + boxW, n.y + boxH / 2, 270, midY + 18)"
        />
        <path
          v-for="n in rightNodes"
          :key="'er-' + n.code"
          :d="edgePath(318, midY + 18, n.x, n.y + boxH / 2)"
        />
      </g>
      <g font-family="'IBM Plex Mono',monospace" font-size="11">
        <template v-for="n in leftNodes" :key="'nl-' + n.code">
          <rect :x="n.x" :y="n.y" :width="boxW" :height="boxH" fill="#0f0f0f" stroke="rgba(255,255,255,0.45)" rx="2" />
          <text :x="n.x + 12" :y="n.y + 21" fill="rgba(255,255,255,0.8)">{{ n.code }}</text>
        </template>
        <rect x="270" y="132" :width="boxW" height="36" fill="rgba(230,48,48,0.12)" stroke="#e63030" stroke-width="2" rx="2" />
        <text x="282" y="154" fill="#f8f8f6">{{ FOCUS }}</text>
        <template v-for="n in rightNodes" :key="'nr-' + n.code">
          <rect :x="n.x" :y="n.y" :width="88" :height="boxH" fill="#0f0f0f" stroke="rgba(255,255,255,0.45)" rx="2" />
          <text :x="n.x + 12" :y="n.y + 21" fill="rgba(255,255,255,0.8)">{{ n.code }}</text>
        </template>
      </g>
    </svg>
    <div class="hub-graph-preview-foot">
      <span class="hub-clickable" @click="navigate('/grafo')">Abrir grafo completo →</span>
    </div>
  </div>
</template>

<style scoped>
.hub-graph-preview {
  background: #0f0f0f;
  border-radius: 4px;
  height: 400px;
  position: relative;
  overflow: hidden;
}
.hub-graph-preview-svg {
  width: 100%;
  height: 340px;
}
.hub-graph-preview-foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18px 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  justify-content: flex-end;
}
.hub-graph-preview-foot span {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: #f8f8f6;
  cursor: pointer;
}
.hub-graph-preview-foot span:hover {
  color: #e63030;
}
</style>
