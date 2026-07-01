import { DISCIPLINES, COLUMNS, EDGES, NODE_W, NODE_H, GAP_Y, Y_START, CANVAS_TOTAL_W } from './data'
import { graphUtils, EDGE_STYLES } from './graphUtils'
import { store } from './store'

/*
 * Everything in this module is plain, non-reactive JS state and DOM
 * manipulation. Pan, zoom, drag and edge/minimap redraws happen on every
 * animation frame — running them through Vue's reactivity would re-render
 * the whole tree each frame and cause jank. Only discrete state changes
 * (selection, search, locale, panel open/close) go through the reactive
 * `store`.
 */

export const nodePositions = {}
const adjacencyIndex = {}

let pan = { x: 0, y: 0 }
let zoom = 0.85
let drag = null
let isPanning = false
let panStart = { x: 0, y: 0 }
let panMoved = false

let canvasWrapper = null
let canvasInner = null
let edgesSvg = null
let minimapEl = null
let zoomIndicatorEl = null

function defaultNodePositions() {
  Object.entries(COLUMNS).forEach(([, col]) => {
    col.nodes.forEach((code, i) => {
      nodePositions[code] = { x: col.x, y: Y_START + i * (NODE_H + GAP_Y) }
    })
  })
}

function buildAdjacencyIndex() {
  EDGES.forEach((edge, i) => {
    if (!adjacencyIndex[edge.from]) adjacencyIndex[edge.from] = new Set()
    if (!adjacencyIndex[edge.to]) adjacencyIndex[edge.to] = new Set()
    adjacencyIndex[edge.from].add(i)
    adjacencyIndex[edge.to].add(i)
  })
}

function buildEdgePaths() {
  edgesSvg.innerHTML = `<defs>
    <marker id="arrow-inactive" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.08)"/>
    </marker>
    <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#e63030"/>
    </marker>
    <marker id="arrow-active-dim" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="rgba(230,48,48,0.4)"/>
    </marker>
  </defs>`

  EDGES.forEach((edge, i) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('id', `edge-${i}`)
    path.setAttribute('fill', 'none')
    edgesSvg.appendChild(path)
    edge._el = path
  })
}

function applyAllNodePositions() {
  DISCIPLINES.forEach((d) => {
    const el = document.getElementById(`node-${d.code}`)
    if (!el) return
    el.style.left = nodePositions[d.code].x + 'px'
    el.style.top = nodePositions[d.code].y + 'px'
  })
}

export function applyTransform() {
  canvasInner.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
  if (zoomIndicatorEl) zoomIndicatorEl.textContent = Math.round(zoom * 100) + '%'
}

export function startDrag(code, el, e) {
  e.preventDefault()
  e.stopPropagation()
  drag = {
    code,
    el,
    startMX: e.clientX,
    startMY: e.clientY,
    startNX: nodePositions[code].x,
    startNY: nodePositions[code].y,
    moved: false,
  }
}

function onDragMove(e) {
  if (!drag) return
  const dx = (e.clientX - drag.startMX) / zoom
  const dy = (e.clientY - drag.startMY) / zoom
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true

  nodePositions[drag.code].x = drag.startNX + dx
  nodePositions[drag.code].y = drag.startNY + dy
  drag.el.style.left = nodePositions[drag.code].x + 'px'
  drag.el.style.top = nodePositions[drag.code].y + 'px'

  const edgeIds = adjacencyIndex[drag.code] || new Set()
  edgeIds.forEach((i) => redrawEdge(i))
  updateMinimap()
}

function onCanvasMousedown(e) {
  if (e.target.closest('.node-card')) return
  isPanning = true
  panMoved = false
  panStart = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  canvasWrapper.classList.add('panning')
}

function onDocumentMousemove(e) {
  if (drag) {
    onDragMove(e)
    return
  }
  if (isPanning) {
    const dx = e.clientX - panStart.x - pan.x
    const dy = e.clientY - panStart.y - pan.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) panMoved = true
    pan.x = e.clientX - panStart.x
    pan.y = e.clientY - panStart.y
    applyTransform()
    updateMinimap()
  }
}

function onDocumentMouseup() {
  if (drag) {
    if (!drag.moved) selectNode(drag.code)
    drag = null
  } else if (isPanning) {
    if (!panMoved) deselectNode()
    isPanning = false
    canvasWrapper.classList.remove('panning')
  }
}

function onWheel(e) {
  e.preventDefault()
  const rect = canvasWrapper.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top
  const factor = e.deltaY > 0 ? 0.92 : 1.08
  const newZoom = Math.min(2.0, Math.max(0.25, zoom * factor))
  const ratio = newZoom / zoom
  pan.x = offsetX - ratio * (offsetX - pan.x)
  pan.y = offsetY - ratio * (offsetY - pan.y)
  zoom = newZoom
  applyTransform()
  updateMinimap()
}

function onMinimapClick(e) {
  const rect = minimapEl.getBoundingClientRect()
  const scale = minimapEl.width / (CANVAS_TOTAL_W + 200)
  const cx = (e.clientX - rect.left) / scale
  const cy = (e.clientY - rect.top) / scale
  const W = canvasWrapper.offsetWidth
  const H = canvasWrapper.offsetHeight
  pan.x = W / 2 - cx * zoom
  pan.y = H / 2 - cy * zoom
  applyTransform()
  updateMinimap()
}

function bindCanvasEvents() {
  canvasWrapper.addEventListener('mousedown', onCanvasMousedown)
  canvasWrapper.addEventListener('wheel', onWheel, { passive: false })
  document.addEventListener('mousemove', onDocumentMousemove)
  document.addEventListener('mouseup', onDocumentMouseup)
  minimapEl.addEventListener('click', onMinimapClick)
}

export function unbindCanvasEvents() {
  if (!canvasWrapper) return
  canvasWrapper.removeEventListener('mousedown', onCanvasMousedown)
  canvasWrapper.removeEventListener('wheel', onWheel)
  document.removeEventListener('mousemove', onDocumentMousemove)
  document.removeEventListener('mouseup', onDocumentMouseup)
  if (minimapEl) minimapEl.removeEventListener('click', onMinimapClick)
}

export function zoomFit() {
  const positions = Object.values(nodePositions)
  const minX = Math.min(...positions.map((p) => p.x))
  const maxX = Math.max(...positions.map((p) => p.x)) + NODE_W
  const minY = Math.min(...positions.map((p) => p.y))
  const maxY = Math.max(...positions.map((p) => p.y)) + NODE_H
  const W = canvasWrapper.offsetWidth
  const H = canvasWrapper.offsetHeight
  zoom = Math.min(W / (maxX - minX), H / (maxY - minY)) * 0.88
  zoom = Math.min(2.0, Math.max(0.25, zoom))
  pan.x = (W - (maxX - minX) * zoom) / 2 - minX * zoom
  pan.y = (H - (maxY - minY) * zoom) / 2 - minY * zoom
  applyTransform()
  updateMinimap()
}

export function resetLayout() {
  defaultNodePositions()
  applyAllNodePositions()
  redrawAllEdges()
  zoom = 0.85
  pan = { x: 0, y: 0 }
  applyTransform()
  updateMinimap()
}

export function panBy(dx, dy) {
  pan.x += dx
  pan.y += dy
  applyTransform()
  updateMinimap()
}

export function redrawEdge(i) {
  const edge = EDGES[i]
  const fromPos = nodePositions[edge.from]
  const toPos = nodePositions[edge.to]
  if (!fromPos || !toPos || !edge._el) return

  const state = graphUtils.getEdgeState(edge.from, edge.to, edge.coreq, store)
  const style = EDGE_STYLES[state] || EDGE_STYLES.inactive
  const el = edge._el

  el.setAttribute('d', graphUtils.bezierPath(fromPos.x, fromPos.y, toPos.x, toPos.y))
  el.setAttribute('stroke', style.stroke)
  el.setAttribute('stroke-width', style.width)
  el.setAttribute('stroke-dasharray', style.dash)
  el.setAttribute('marker-end', `url(#${style.marker})`)
}

export function redrawAllEdges() {
  EDGES.forEach((_, i) => redrawEdge(i))
}

export function applyNodeStates() {
  const searchActive = store.search.trim().length > 0
  DISCIPLINES.forEach((d) => {
    const el = document.getElementById(`node-${d.code}`)
    if (!el) return
    el.className = 'node-card'
    el.classList.add(`state-${graphUtils.getNodeState(d.code, store, searchActive)}`)
  })
}

export function selectNode(code) {
  if (store.selected === code) {
    deselectNode()
    return
  }
  store.selected = code
  store.sidePanelOpen = true
}

export function deselectNode() {
  store.selected = null
  store.sidePanelOpen = false
}

export function updateMinimap() {
  if (!minimapEl) return
  const ctx = minimapEl.getContext('2d')
  const W = minimapEl.width
  const H = minimapEl.height
  const scale = W / (CANVAS_TOTAL_W + 200)

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(10,10,10,0.9)'
  ctx.fillRect(0, 0, W, H)

  DISCIPLINES.forEach((d) => {
    const p = nodePositions[d.code]
    if (!p) return
    ctx.fillStyle = d.code === store.selected ? '#e63030' : 'rgba(255,255,255,0.55)'
    ctx.fillRect(p.x * scale, p.y * scale, 4, 3)
  })

  if (canvasWrapper) {
    const W2 = canvasWrapper.offsetWidth
    const H2 = canvasWrapper.offsetHeight
    const vx = (-pan.x / zoom) * scale
    const vy = (-pan.y / zoom) * scale
    const vw = (W2 / zoom) * scale
    const vh = (H2 / zoom) * scale
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.setLineDash([2, 2])
    ctx.lineWidth = 1
    ctx.strokeRect(vx, vy, vw, vh)
    ctx.setLineDash([])
  }
}

export function initCanvas(refs) {
  canvasWrapper = refs.wrapper
  canvasInner = refs.inner
  edgesSvg = refs.svg
  minimapEl = refs.minimap
  zoomIndicatorEl = refs.zoomIndicator

  defaultNodePositions()
  buildAdjacencyIndex()
  buildEdgePaths()
  applyAllNodePositions()
  redrawAllEdges()
  bindCanvasEvents()
  applyTransform()
  updateMinimap()
}
