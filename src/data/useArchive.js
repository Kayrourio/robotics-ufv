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

// contagem de arquivos por tópico (prova/lista/resumo/slide/livro)
export function typeCounts(discipline) {
  return TYPES.map((type) => ({
    type,
    count: discipline.files.filter((f) => f.type === type).length,
  }))
}

// arquivos agrupados por tópico, só tópicos com conteúdo
export function filesByType(discipline) {
  return typeCounts(discipline)
    .filter((t) => t.count > 0)
    .map((t) => ({
      type: t.type,
      count: t.count,
      files: discipline.files.filter((f) => f.type === t.type),
    }))
}

export function toggleExpanded(code) {
  if (archiveState.expanded.has(code)) archiveState.expanded.delete(code)
  else archiveState.expanded.add(code)
}

// Cards da vitrine na landing: prioriza disciplinas com material; se o
// archive ainda estiver vazio, mostra as primeiras do currículo.
export function sampleCards(n = 7) {
  const withFiles = archiveData.disciplines.filter((d) => d.files.length > 0)
  if (withFiles.length >= n) return withFiles.slice(0, n)
  const rest = archiveData.disciplines.filter((d) => d.files.length === 0)
  return [...withFiles, ...rest].slice(0, n)
}
