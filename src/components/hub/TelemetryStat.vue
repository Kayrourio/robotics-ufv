<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  value: { type: [Number, String], required: true },
  label: { type: String, required: true },
  suffix: { type: String, default: '' },
  delay: { type: Number, default: 0 },
})

const display = ref('0')
const numeric = typeof props.value === 'number' ? props.value : parseInt(props.value, 10)
const isNumeric = !Number.isNaN(numeric)

function boot() {
  if (!isNumeric) {
    display.value = String(props.value)
    return
  }
  const duration = 700
  const start = performance.now()
  function tick(now) {
    const p = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - p, 3)
    display.value = Math.round(numeric * eased).toString()
    if (p < 1) requestAnimationFrame(tick)
    else display.value = String(numeric)
  }
  requestAnimationFrame(tick)
}

// Dispara quando o v-reveal do wrapper pai entra em vista (evento custom).
defineExpose({ boot })
watch(
  () => props.value,
  () => boot(),
)
</script>

<template>
  <div class="hub-stat-row" :style="{ '--hub-i': delay }" v-reveal="delay" @vue:mounted="boot">
    <span class="hub-stat-icon"><slot name="icon" /></span>
    <div>
      <div class="hub-stat-value">{{ display }}{{ suffix }}</div>
      <div class="hub-stat-label"><slot name="label">{{ label }}</slot></div>
    </div>
  </div>
</template>
