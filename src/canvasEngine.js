import {
  DISCIPLINES,
  DISCIPLINE_MAP,
  EDGES,
  NODE_W,
  NODE_H,
  GAP_Y,
  Y_START,
  CANVAS_TOTAL_W,
  COL_WIDTH,
  COL_X0,
  DEFAULT_MAX_PERIOD,
  periodX,
} from './data'
import { graphUtils, EDGE_STYLES } from './graphUtils'
import { store } from './store'
import {
  computeEffectivePeriods,
  getMinRequiredPeriod,
  setOverride,
  resetOverride,
  resetAllOverrides,
} from './scheduling'

/*
 * Everything in this module is plain, non-reactive JS state and DOM
 * manipulation. Pan, zoom, drag and edge/minimap redraws happen on every
 * animation frame — running them through Vue's reactivity would re-render
 * the whole tree each frame and cause jank. Only discrete state changes
 * (selection, search, locale, panel open/close, "who moved") go through the
 * reactive `store`.
 *
 * Layout itself is no longer free-pixel: a node's position is always
 * derived from its *effective period* (see scheduling.js), snapped into a
 * column. Dragging only chooses which column a course lands in; relayout()
 * then cascades that choice through every prereq/coreq dependent in one
 * topological pass and re-lays out the whole graph.
 */

export const nodePositions = {}
const adjacencyIndex = {}
const catalogIndex = {}
DISCIPLINES.forEach((d, i) => (catalogIndex[d.code] = i))

let pan = { x: 0, y: 0 }
let zoom = 0.85
let drag = null
let isPanning = false
let panStart = { x: 0, y: 0 }
let panMoved = false
let previousEffective = null
let pinch = null
let lastTap = { code: null, time: 0 }

// Normalizes mouse/touch events to a single {x, y} point so pan/drag/click
// logic can be shared between input types instead of duplicated.
function getPoint(e) {
  if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  if (e.changedTouches && e.changedTouches.length) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
  }
  return { x: e.clientX, y: e.clientY }
}

function pinchDistance(touches) {
  return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)
}

function handlePinchMove(touches) {
  const dist = pinchDistance(touches)
  if (!pinch) {
    pinch = {
      startDist: dist,
      startZoom: zoom,
      startPanX: pan.x,
      startPanY: pan.y,
      centerX: (touches[0].clientX + touches[1].clientX) / 2,
      centerY: (touches[0].clientY + touches[1].clientY) / 2,
    }
    return
  }
  const scale = dist / pinch.startDist
  const newZoom = Math.min(2.0, Math.max(0.25, pinch.startZoom * scale))
  const rect = canvasWrapper.getBoundingClientRect()
  const offsetX = pinch.centerX - rect.left
  const offsetY = pinch.centerY - rect.top
  const ratio = newZoom / pinch.startZoom
  pan.x = offsetX - ratio * (offsetX - pinch.startPanX)
  pan.y = offsetY - ratio * (offsetY - pinch.startPanY)
  zoom = newZoom
  applyTransform()
  updateMinimap()
}

let canvasWrapper = null
let canvasInner = null
let edgesSvg = null
let minimapEl = null
let zoomIndicatorEl = null
let dropTargetEl = null

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

function pulseNode(code) {
  const el = document.getElementById(`node-${code}`)
  if (!el) return
  el.classList.remove('pulse')
  void el.offsetWidth // restart the CSS animation
  el.classList.add('pulse')
  setTimeout(() => el.classList.remove('pulse'), 650)
}

// Recompute effective periods for the whole graph, re-lay out every node
// into its column, and sync `store.movedNodes`/`moveInfo` for badges.
export function relayout() {
  const effective = computeEffectivePeriods()
  const isFirstRun = previousEffective === null

  const groups = {}
  DISCIPLINES.forEach((d) => {
    const period = effective[d.code]
    if (!groups[period]) groups[period] = []
    groups[period].push(d.code)
  })
  Object.values(groups).forEach((list) => {
    list.sort((a, b) => {
      const pa = DISCIPLINE_MAP[a].period
      const pb = DISCIPLINE_MAP[b].period
      if (pa !== pb) return pa - pb
      return catalogIndex[a] - catalogIndex[b]
    })
  })
  Object.entries(groups).forEach(([period, list]) => {
    list.forEach((code, i) => {
      nodePositions[code] = { x: periodX(Number(period)), y: Y_START + i * (NODE_H + GAP_Y) }
    })
  })

  const moved = new Set()
  const moveInfo = {}
  const changedNow = new Set()
  DISCIPLINES.forEach((d) => {
    const eff = effective[d.code]
    if (eff !== d.period) {
      moved.add(d.code)
      moveInfo[d.code] = { from: d.period, to: eff }
    }
    if (!previousEffective || previousEffective[d.code] !== eff) changedNow.add(d.code)
  })
  store.movedNodes = moved
  store.moveInfo = moveInfo
  store.maxPeriod = Math.max(DEFAULT_MAX_PERIOD, ...Object.values(effective))

  applyAllNodePositions()
  redrawAllEdges()
  applyNodeStates()
  updateMinimap()

  if (!isFirstRun) changedNow.forEach((code) => pulseNode(code))
  previousEffective = effective
}

export function applyTransform() {
  canvasInner.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
  if (zoomIndicatorEl) zoomIndicatorEl.textContent = Math.round(zoom * 100) + '%'
}

function columnFromX(x) {
  return Math.max(1, Math.round((x - COL_X0) / COL_WIDTH) + 1)
}

function showDropTarget(period) {
  if (!dropTargetEl) return
  dropTargetEl.style.display = 'block'
  dropTargetEl.style.left = periodX(period) - 20 + 'px'
}

function hideDropTarget() {
  if (!dropTargetEl) return
  dropTargetEl.style.display = 'none'
}

export function startDrag(code, el, e) {
  if (e.touches && e.touches.length > 1) return // let pinch-zoom take over
  e.preventDefault()
  e.stopPropagation()
  const p = getPoint(e)
  drag = {
    code,
    el,
    startMX: p.x,
    startMY: p.y,
    startNX: nodePositions[code].x,
    startNY: nodePositions[code].y,
    moved: false,
    targetPeriod: previousEffective ? previousEffective[code] : DISCIPLINE_MAP[code].period,
  }
}

function onDragMove(e) {
  if (!drag) return
  const p = getPoint(e)
  const dx = (p.x - drag.startMX) / zoom
  const dy = (p.y - drag.startMY) / zoom
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true

  nodePositions[drag.code].x = drag.startNX + dx
  nodePositions[drag.code].y = drag.startNY + dy
  drag.el.style.left = nodePositions[drag.code].x + 'px'
  drag.el.style.top = nodePositions[drag.code].y + 'px'

  const edgeIds = adjacencyIndex[drag.code] || new Set()
  edgeIds.forEach((i) => redrawEdge(i))
  updateMinimap()

  if (drag.moved) {
    drag.el.classList.add('dragging')
    drag.targetPeriod = columnFromX(nodePositions[drag.code].x)
    showDropTarget(drag.targetPeriod)
  }
}

function onCanvasMousedown(e) {
  if (e.touches) {
    if (e.touches.length > 1) return // let pinch-zoom take over
    e.preventDefault()
  }
  if (e.target.closest('.node-card')) return
  const p = getPoint(e)
  isPanning = true
  panMoved = false
  panStart = { x: p.x - pan.x, y: p.y - pan.y }
  canvasWrapper.classList.add('panning')
}

function onDocumentMousemove(e) {
  if (e.touches && e.touches.length === 2) {
    e.preventDefault()
    handlePinchMove(e.touches)
    return
  }
  if (pinch) pinch = null

  if (drag) {
    if (e.touches) e.preventDefault()
    onDragMove(e)
    return
  }
  if (isPanning) {
    if (e.touches) e.preventDefault()
    const p = getPoint(e)
    const dx = p.x - panStart.x - pan.x
    const dy = p.y - panStart.y - pan.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) panMoved = true
    pan.x = p.x - panStart.x
    pan.y = p.y - panStart.y
    applyTransform()
    updateMinimap()
  }
}

function onDocumentMouseup(e) {
  if (e && e.touches && e.touches.length < 2) pinch = null

  if (drag) {
    drag.el.classList.remove('dragging')
    hideDropTarget()
    if (!drag.moved) {
      if (e && e.changedTouches) {
        const now = Date.now()
        if (lastTap.code === drag.code && now - lastTap.time < 350) {
          onNodeDoubleClick(drag.code)
          lastTap = { code: null, time: 0 }
        } else {
          selectNode(drag.code)
          lastTap = { code: drag.code, time: now }
        }
      } else {
        selectNode(drag.code)
      }
    } else {
      const effectiveBefore = computeEffectivePeriods()
      const minReq = getMinRequiredPeriod(drag.code, effectiveBefore)
      const clamped = Math.max(drag.targetPeriod, minReq)
      setOverride(drag.code, clamped)
      relayout()
    }
    drag = null
  } else if (isPanning) {
    if (!panMoved) deselectNode()
    isPanning = false
    canvasWrapper.classList.remove('panning')
  }
}

export function onNodeDoubleClick(code) {
  resetOverride(code)
  relayout()
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
  canvasWrapper.addEventListener('touchstart', onCanvasMousedown, { passive: false })
  document.addEventListener('mousemove', onDocumentMousemove)
  document.addEventListener('mouseup', onDocumentMouseup)
  document.addEventListener('touchmove', onDocumentMousemove, { passive: false })
  document.addEventListener('touchend', onDocumentMouseup)
  document.addEventListener('touchcancel', onDocumentMouseup)
  minimapEl.addEventListener('click', onMinimapClick)
}

export function unbindCanvasEvents() {
  if (!canvasWrapper) return
  canvasWrapper.removeEventListener('mousedown', onCanvasMousedown)
  canvasWrapper.removeEventListener('wheel', onWheel)
  canvasWrapper.removeEventListener('touchstart', onCanvasMousedown)
  document.removeEventListener('mousemove', onDocumentMousemove)
  document.removeEventListener('mouseup', onDocumentMouseup)
  document.removeEventListener('touchmove', onDocumentMousemove)
  document.removeEventListener('touchend', onDocumentMouseup)
  document.removeEventListener('touchcancel', onDocumentMouseup)
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
  resetAllOverrides()
  relayout()
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
    if (store.movedNodes.has(d.code)) el.classList.add('state-moved')
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
  dropTargetEl = refs.dropTarget

  buildAdjacencyIndex()
  buildEdgePaths()
  relayout()
  bindCanvasEvents()
  applyTransform()
}
