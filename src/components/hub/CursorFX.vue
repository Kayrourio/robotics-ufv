<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const dot = ref(null)
let x = 0
let y = 0
let raf = null

function onMove(e) {
  x = e.clientX
  y = e.clientY
  if (!raf) raf = requestAnimationFrame(paint)
  const el = dot.value
  if (!el) return
  el.classList.add('active')
  const target = e.target && e.target.closest
    ? e.target.closest('a, button, [role="button"], input[type="text"], .hub-clickable')
    : null
  el.classList.toggle('hovering', !!target)
}

function paint() {
  if (dot.value) dot.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
  raf = null
}

function onLeave() {
  dot.value && dot.value.classList.remove('active')
}

onMounted(() => {
  window.addEventListener('pointermove', onMove)
  document.addEventListener('mouseleave', onLeave)
})
onUnmounted(() => {
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('mouseleave', onLeave)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <div ref="dot" class="hub-cursor-dot" aria-hidden="true"></div>
</template>
