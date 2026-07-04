<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

// Esquemático wireframe do R2-D2 em 3D, estilo blueprint: linhas brancas
// translúcidas + acentos vermelhos, auto-rotação lenta e arrasto manual
// com inércia. Construído por primitivas (domo, corpo, pernas, pés) para
// não depender de nenhum modelo externo.

const host = ref(null)

let renderer = null
let scene = null
let camera = null
let r2 = null
let raf = 0
let resizeObserver = null

// interação
let dragging = false
let lastX = 0
let lastY = 0
let velY = 0
let tiltX = 0
const AUTO_SPEED = 0.0045

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function lineMat(opacity, color = 0xf0f0f0) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity })
}

function dashMat(opacity, color = 0xf0f0f0, dashSize = 0.09, gapSize = 0.07) {
  return new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize, gapSize })
}

function edges(geometry, opacity, color) {
  return new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 12), lineMat(opacity, color))
}

function polyline(points, material, closed = false) {
  const geo = new THREE.BufferGeometry().setFromPoints(points)
  const line = closed ? new THREE.LineLoop(geo, material) : new THREE.Line(geo, material)
  if (material.isLineDashedMaterial) line.computeLineDistances()
  return line
}

function circlePoints(radius, y, segments = 64) {
  return Array.from({ length: segments }, (_, i) => {
    const a = (i / segments) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius)
  })
}

// cruz de anotação "+" (marca de blueprint)
function annotationCross(x, y, z, size = 0.12) {
  const g = new THREE.Group()
  const mat = lineMat(0.85, 0xe63030)
  g.add(polyline([new THREE.Vector3(x - size, y, z), new THREE.Vector3(x + size, y, z)], mat))
  g.add(polyline([new THREE.Vector3(x, y - size, z), new THREE.Vector3(x, y + size, z)], mat))
  return g
}

function buildR2() {
  const g = new THREE.Group()
  const R = 1.02 // raio do corpo
  const DOME_Y = 1.2

  // ---- corpo ----
  // sem wireframe cheio: anéis (2 fortes nas bordas, 3 leves intermediários)
  // + seams verticais, para dar volume sem virar malha
  ;[
    [1.2, 0.55],
    [0.62, 0.2],
    [0.15, 0.32],
    [-0.45, 0.2],
    [-0.9, 0.55],
  ].forEach(([y, op]) => {
    g.add(polyline(circlePoints(R, y), lineMat(op), true))
  })
  // seams verticais de painel no corpo
  ;[0.35, 1.4, 2.45, 3.5, 4.55, 5.6].forEach((a) => {
    const p1 = new THREE.Vector3(Math.cos(a) * R, 1.2, Math.sin(a) * R)
    const p2 = new THREE.Vector3(Math.cos(a) * R, -0.9, Math.sin(a) * R)
    g.add(polyline([p1, p2], lineMat(0.24)))
  })

  // ---- domo ----
  // anéis de latitude do domo (painéis)
  ;[
    [0.22, 0.5],
    [0.6, 0.35],
    [0.92, 0.5],
  ].forEach(([dy, op]) => {
    const r = Math.sqrt(Math.max(0, R * R - dy * dy))
    g.add(polyline(circlePoints(r, DOME_Y + dy), lineMat(op), true))
  })
  // seams radiais do domo (meridianos)
  ;[0.5, 2.7, 4.9].forEach((az) => {
    const pts = Array.from({ length: 24 }, (_, i) => {
      const t = (i / 23) * (Math.PI / 2)
      return new THREE.Vector3(
        Math.sin(t) * R * Math.cos(az),
        DOME_Y + Math.cos(t) * R,
        Math.sin(t) * R * Math.sin(az),
      )
    })
    g.add(polyline(pts, lineMat(0.25)))
  })
  // contorno do domo (silhueta): semicírculo de "borda" leve dos dois lados
  ;[0, Math.PI / 2].forEach((az) => {
    const pts = Array.from({ length: 32 }, (_, i) => {
      const t = -Math.PI / 2 + (i / 31) * Math.PI
      return new THREE.Vector3(
        Math.sin(t) * R * Math.cos(az),
        DOME_Y + Math.cos(t) * R,
        Math.sin(t) * R * Math.sin(az),
      )
    })
    g.add(polyline(pts, lineMat(0.18)))
  })

  // olho principal (vermelho) + aro
  const eye = edges(new THREE.CylinderGeometry(0.17, 0.17, 0.07, 20), 0.95, 0xe63030)
  eye.rotation.x = Math.PI / 2 - 0.5
  eye.position.set(0, 1.75, 0.82)
  g.add(eye)
  const eyeInner = edges(new THREE.CylinderGeometry(0.075, 0.075, 0.09, 14), 0.7, 0xe63030)
  eyeInner.rotation.x = Math.PI / 2 - 0.5
  eyeInner.position.set(0, 1.74, 0.87)
  g.add(eyeInner)

  // projetores/sensores secundários no domo
  const proj = edges(new THREE.CylinderGeometry(0.1, 0.13, 0.16, 12), 0.6)
  proj.rotation.x = Math.PI / 2 - 0.9
  proj.position.set(0.5, 1.95, 0.55)
  g.add(proj)
  const sensor = edges(new THREE.CylinderGeometry(0.07, 0.09, 0.12, 10), 0.5)
  sensor.rotation.x = Math.PI / 2 - 1.1
  sensor.position.set(-0.55, 2.0, 0.42)
  g.add(sensor)
  // painéis retangulares do domo (frente e traseira)
  ;[
    [0.28, 1.62, 0.9, 0.26, 0.18],
    [-0.4, 1.55, 0.88, 0.3, 0.14],
    [0.1, 1.5, -0.98, 0.4, 0.22],
  ].forEach(([x, y, z, w, h]) => {
    const panel = edges(new THREE.BoxGeometry(w, h, 0.03), 0.5)
    panel.position.set(x, y, z)
    panel.lookAt(new THREE.Vector3(x * 3, y, z * 3))
    g.add(panel)
  })

  // ---- painéis e greebles do corpo ----
  const panelA = edges(new THREE.BoxGeometry(0.52, 0.34, 0.05), 0.6)
  panelA.position.set(0, 0.72, R - 0.02)
  g.add(panelA)
  // recesso interno do painel A
  const panelA2 = edges(new THREE.BoxGeometry(0.4, 0.22, 0.06), 0.35)
  panelA2.position.set(0, 0.72, R)
  g.add(panelA2)
  const panelB = edges(new THREE.BoxGeometry(0.4, 0.5, 0.05), 0.5)
  panelB.position.set(0, 0.08, R)
  g.add(panelB)
  // vents frontais (grade com linhas horizontais)
  const vent = edges(new THREE.BoxGeometry(0.34, 0.28, 0.05), 0.5)
  vent.position.set(0, -0.5, R + 0.01)
  g.add(vent)
  ;[-0.56, -0.5, -0.44].forEach((y) => {
    g.add(
      polyline(
        [new THREE.Vector3(-0.13, y, R + 0.045), new THREE.Vector3(0.13, y, R + 0.045)],
        lineMat(0.4),
      ),
    )
  })
  // portinholas laterais/traseiras (aparecem quando gira)
  ;[
    [2.2, 0.55, 0.3, 0.4],
    [Math.PI, 0.3, 0.5, 0.6],
    [4.1, 0.65, 0.26, 0.3],
    [2.7, -0.35, 0.34, 0.28],
  ].forEach(([az, y, w, h]) => {
    const door = edges(new THREE.BoxGeometry(w, h, 0.04), 0.4)
    door.position.set(Math.sin(az) * R, y, Math.cos(az) * R)
    door.lookAt(new THREE.Vector3(Math.sin(az) * 3, y, Math.cos(az) * 3))
    g.add(door)
  })
  // soquetes circulares (braço utilitário / carga)
  ;[
    [0.42, -0.15, 0.12],
    [-0.42, -0.15, 0.09],
  ].forEach(([x, y, r]) => {
    const dyAdjust = Math.sqrt(Math.max(0, R * R - x * x))
    const sock = edges(new THREE.CylinderGeometry(r, r, 0.06, 16), 0.55)
    sock.rotation.x = Math.PI / 2
    sock.position.set(x, y, dyAdjust + 0.01)
    g.add(sock)
  })
  // greebles centrais extras: acoplamento de força + painel de dados
  const coupling = edges(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 18), 0.5)
  coupling.rotation.x = Math.PI / 2
  coupling.position.set(0, -0.78, R)
  g.add(coupling)
  const couplingInner = edges(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12), 0.35)
  couplingInner.rotation.x = Math.PI / 2
  couplingInner.position.set(0, -0.78, R + 0.02)
  g.add(couplingInner)
  const dataPanel = edges(new THREE.BoxGeometry(0.26, 0.16, 0.05), 0.5)
  dataPanel.position.set(0.55, 0.45, Math.sqrt(Math.max(0, R * R - 0.3)))
  dataPanel.lookAt(new THREE.Vector3(1.65, 0.45, 2.6))
  g.add(dataPanel)
  const dataPanelB = edges(new THREE.BoxGeometry(0.22, 0.3, 0.05), 0.45)
  dataPanelB.position.set(-0.55, 0.35, Math.sqrt(Math.max(0, R * R - 0.3)))
  dataPanelB.lookAt(new THREE.Vector3(-1.65, 0.35, 2.6))
  g.add(dataPanelB)

  // ---- pernas ----
  ;[-1, 1].forEach((side) => {
    const leg = new THREE.Group()
    const LX = side * 1.28

    // ombro: disco externo + anéis internos + parafusos
    const shoulder = edges(new THREE.CylinderGeometry(0.44, 0.44, 0.28, 20), 0.6)
    shoulder.rotation.z = Math.PI / 2
    shoulder.position.set(side * 1.16, 0.85, 0)
    leg.add(shoulder)
    const shoulderRing = edges(new THREE.CylinderGeometry(0.22, 0.22, 0.001, 16), 0.4)
    shoulderRing.rotation.z = Math.PI / 2
    shoulderRing.position.set(side * 1.31, 0.85, 0)
    leg.add(shoulderRing)
    // parafusos do ombro
    ;[0, 2.1, 4.2].forEach((a) => {
      const bolt = edges(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), 0.45)
      bolt.rotation.z = Math.PI / 2
      bolt.position.set(side * 1.315, 0.85 + Math.cos(a) * 0.33, Math.sin(a) * 0.33)
      leg.add(bolt)
    })

    // perna única (coxa até o tornozelo) — menos caixas sobrepostas
    const upper = edges(new THREE.BoxGeometry(0.28, 2.05, 0.6), 0.55)
    upper.position.set(LX, -0.18, 0.06)
    upper.rotation.x = 0.06
    leg.add(upper)
    // pistão hidráulico (detalhe mecânico)
    leg.add(
      polyline(
        [new THREE.Vector3(LX, 0.62, 0.36), new THREE.Vector3(LX, -1.05, 0.58)],
        lineMat(0.4),
      ),
    )

    // pé
    const foot = edges(new THREE.BoxGeometry(0.44, 0.5, 1.3), 0.65)
    foot.position.set(LX, -1.46, 0.2)
    leg.add(foot)
    const footFront = edges(new THREE.BoxGeometry(0.44, 0.3, 0.42), 0.45)
    footFront.position.set(LX, -1.36, 1.0)
    footFront.rotation.x = 0.5
    leg.add(footFront)
    // treads (esteira) do pé
    ;[-0.2, 0.12, 0.44].forEach((z) => {
      leg.add(
        polyline(
          [new THREE.Vector3(LX - 0.22, -1.71, z), new THREE.Vector3(LX + 0.22, -1.71, z)],
          lineMat(0.35),
        ),
      )
    })

    g.add(leg)
  })

  // ---- perna central ----
  const centerLeg = edges(new THREE.BoxGeometry(0.24, 1.1, 0.36), 0.4)
  centerLeg.position.set(0, -1.35, 0.25)
  centerLeg.rotation.x = 0.22
  g.add(centerLeg)
  const centerFoot = edges(new THREE.BoxGeometry(0.36, 0.34, 0.9), 0.45)
  centerFoot.position.set(0, -1.85, 0.45)
  g.add(centerFoot)

  // ---- anotações de blueprint ----
  g.add(annotationCross(1.55, 1.9, 0.3))
  g.add(annotationCross(-1.5, 0.85, 0.55))
  g.add(annotationCross(0.35, 2.35, 0))
  g.add(annotationCross(1.75, -1.45, 0.6))
  g.add(annotationCross(-0.9, -0.4, 1.05, 0.09))

  // régua de medida vertical (tracejada, com ticks)
  const railX = 2.35
  g.add(
    polyline(
      [new THREE.Vector3(railX, -2.05, 0), new THREE.Vector3(railX, 2.25, 0)],
      dashMat(0.35, 0xf0f0f0, 0.07, 0.06),
    ),
  )
  ;[-2.05, 1.2, 2.25].forEach((y) => {
    g.add(
      polyline([new THREE.Vector3(railX - 0.09, y, 0), new THREE.Vector3(railX + 0.09, y, 0)], lineMat(0.4)),
    )
  })

  // anel orbital tracejado (reticle) inclinado
  const orbitPts = circlePoints(2.5, 0, 90)
  const orbit = polyline(orbitPts, dashMat(0.25, 0xe63030, 0.12, 0.1), true)
  orbit.rotation.x = 1.25
  orbit.position.y = 0.3
  g.add(orbit)

  // círculos de referência no chão
  g.add(polyline(circlePoints(2.1, -2.05), dashMat(0.3, 0xe63030, 0.14, 0.1), true))
  g.add(polyline(circlePoints(1.55, -2.05, 48), lineMat(0.1), true))

  return g
}

function onPointerDown(e) {
  dragging = true
  lastX = e.clientX
  lastY = e.clientY
  velY = 0
  host.value.setPointerCapture && host.value.setPointerCapture(e.pointerId)
}

function onPointerMove(e) {
  if (!dragging || !r2) return
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY
  r2.rotation.y += dx * 0.008
  velY = dx * 0.008
  tiltX = Math.max(-0.45, Math.min(0.45, tiltX + dy * 0.004))
}

function onPointerUp() {
  dragging = false
}

function tick() {
  if (r2) {
    if (!dragging) {
      // inércia decai suavemente de volta para a auto-rotação
      const auto = reducedMotion ? 0 : AUTO_SPEED
      velY += (auto - velY) * 0.04
      r2.rotation.y += velY
      tiltX += (0 - tiltX) * 0.03
    }
    r2.rotation.x += (tiltX - r2.rotation.x) * 0.12
  }
  renderer.render(scene, camera)
  raf = requestAnimationFrame(tick)
}

function resize() {
  if (!host.value || !renderer) return
  const w = host.value.clientWidth
  const h = host.value.clientHeight
  if (!w || !h) return
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

onMounted(() => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50)
  camera.position.set(0, 0.35, 7.2)

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
  renderer.domElement.classList.add('r2-canvas')
  host.value.appendChild(renderer.domElement)

  r2 = buildR2()
  r2.rotation.y = -0.6
  scene.add(r2)

  velY = reducedMotion ? 0 : AUTO_SPEED

  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host.value)

  host.value.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)

  raf = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  resizeObserver && resizeObserver.disconnect()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
  scene && scene.traverse((obj) => {
    obj.geometry && obj.geometry.dispose()
    obj.material && obj.material.dispose()
  })
})
</script>

<template>
  <div ref="host" class="r2-host" aria-label="Esquemático 3D do R2-D2 — arraste para girar">
    <span class="r2-hint hub-mono">← ARRASTE PARA GIRAR →</span>
  </div>
</template>

<style scoped>
.r2-host {
  position: relative;
  width: 100%;
  height: 480px;
  cursor: grab;
  /* pan-y: arrasto horizontal gira o modelo, vertical rola a página */
  touch-action: pan-y;
  animation: r2-in 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.r2-host:active {
  cursor: grabbing;
}
.r2-host :deep(.r2-canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
.r2-hint {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  letter-spacing: 2px;
  color: rgba(240, 240, 240, 0.28);
  pointer-events: none;
  white-space: nowrap;
}
@keyframes r2-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .r2-host {
    animation: none;
  }
}
@media (max-width: 1100px) {
  .r2-host {
    height: 340px;
  }
}
</style>
