import { computed, reactive } from 'vue'
import archiveData from './archive.json'

export const TYPES = archiveData.types

const PERIOD_LABELS = {
  1: '1º Período', 2: '2º Período', 3: '3º Período', 4: '4º Período', 5: '5º Período',
  6: '6º Período', 7: '7º Período', 8: '8º Período', 9: '9º Período', 10: '10º Período',
}

export const archiveState = reactive({
  search: '',
  activeType: 'todos',
  expanded: new Set(),
})

function matches(d) {
  const q = archiveState.search.trim().toLowerCase()
  const typeOk =
    archiveState.activeType === 'todos' ||
    d.files.some((f) => f.type === archiveState.activeType)
  if (!typeOk) return false
  if (!q) return true
  if (d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)) return true
  return d.files.some((f) => f.name.toLowerCase().includes(q))
}

export const filteredPeriods = computed(() => {
  const byPeriod = new Map()
  archiveData.disciplines.forEach((d) => {
    if (!matches(d)) return
    if (!byPeriod.has(d.period)) byPeriod.set(d.period, [])
    byPeriod.get(d.period).push(d)
  })
  return [...byPeriod.keys()]
    .sort((a, b) => a - b)
    .map((period) => ({
      period,
      title: PERIOD_LABELS[period] || `${period}º Período`,
      count: `${byPeriod.get(period).length} disciplinas`,
      disciplines: byPeriod.get(period),
    }))
})

export const totalDisciplines = archiveData.disciplines.length
export const totalPeriods = new Set(archiveData.disciplines.map((d) => d.period)).size
export const totalFiles = archiveData.disciplines.reduce((n, d) => n + d.files.length, 0)

export function typeBars(discipline) {
  return TYPES.map((type) => discipline.files.some((f) => f.type === type))
}

export function toggleExpanded(code) {
  if (archiveState.expanded.has(code)) archiveState.expanded.delete(code)
  else archiveState.expanded.add(code)
}

// Sample cards used on the landing page preview grid.
export function sampleCards(n = 7) {
  return archiveData.disciplines.filter((d) => d.files.length > 0).slice(0, n)
}
