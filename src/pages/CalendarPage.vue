<script setup>
import { computed, onMounted, ref } from 'vue'
import { calendarState, loadCalendar, EVENT_TYPES } from '../data/calendar'
import { downloadIcs } from '../data/ics'
import { DISCIPLINE_MAP } from '../data'
import SiteNav from '../components/hub/SiteNav.vue'
import SiteFooter from '../components/hub/SiteFooter.vue'

const view = ref('lista') // lista | mes
const activeType = ref('todos')
const activeDiscipline = ref('todas')

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const typeLabels = { todos: 'Todos', prova: 'Provas', entrega: 'Entregas', evento: 'Eventos', prazo: 'Prazos' }

const disciplineOptions = computed(() => {
  const set = new Set(calendarState.events.map((e) => e.discipline).filter(Boolean))
  return ['todas', ...[...set].sort()]
})

const filteredEvents = computed(() =>
  calendarState.events.filter((e) => {
    if (activeType.value !== 'todos' && e.type !== activeType.value) return false
    if (activeDiscipline.value !== 'todas' && e.discipline !== activeDiscipline.value) return false
    return true
  }),
)

const monthCursor = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

const monthLabel = computed(() => `${MONTH_NAMES[monthCursor.value.getMonth()]} ${monthCursor.value.getFullYear()}`)

function shiftMonth(delta) {
  const d = new Date(monthCursor.value)
  d.setMonth(d.getMonth() + delta)
  monthCursor.value = d
}

const monthCells = computed(() => {
  const year = monthCursor.value.getFullYear()
  const month = monthCursor.value.getMonth()
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const byDay = new Map()
  filteredEvents.value.forEach((e) => {
    const d = new Date(e.date + 'T00:00:00')
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate()
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key).push(e)
    }
  })
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, events: byDay.get(day) || [] })
  }
  return cells
})

function formatFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' })
}

function disciplineName(code) {
  return DISCIPLINE_MAP[code] ? DISCIPLINE_MAP[code].name : ''
}

function exportAll() {
  downloadIcs(filteredEvents.value)
}

onMounted(loadCalendar)
</script>

<template>
  <div class="hub">
    <site-nav></site-nav>

    <header class="cal-head hub-wrap">
      <div class="hub-eyebrow" v-reveal="0">03 — CALENDÁRIO</div>
      <div class="cal-head-row" v-reveal="1">
        <div>
          <h1 class="cal-h1">Eventos do semestre.</h1>
          <p class="cal-sub">Provas, entregas e prazos, direto da planilha da turma.</p>
        </div>
        <button class="hub-btn primary" @click="exportAll" :disabled="!filteredEvents.length">
          Exportar .ics <span>↓</span>
        </button>
      </div>
    </header>

    <div class="cal-controls hub-wrap" v-reveal="0">
      <div class="cal-view-toggle">
        <button class="hub-pill" :class="{ active: view === 'lista' }" @click="view = 'lista'">Lista</button>
        <button class="hub-pill" :class="{ active: view === 'mes' }" @click="view = 'mes'">Mês</button>
      </div>
      <div class="cal-filters">
        <select v-model="activeType" class="hub-mono cal-select">
          <option v-for="t in ['todos', ...EVENT_TYPES]" :key="t" :value="t">{{ typeLabels[t] || t }}</option>
        </select>
        <select v-model="activeDiscipline" class="hub-mono cal-select">
          <option v-for="d in disciplineOptions" :key="d" :value="d">{{ d === 'todas' ? 'Todas disciplinas' : d }}</option>
        </select>
      </div>
    </div>

    <main class="cal-body hub-wrap">
      <div v-if="calendarState.status === 'unconfigured'" class="cal-state hub-mono">
        // Calendário ainda não configurado.<br />
        Defina VITE_CALENDAR_SHEET_CSV_URL no .env apontando para uma planilha Google Sheets
        publicada como CSV (colunas: date, title, type, discipline).
      </div>
      <div v-else-if="calendarState.status === 'loading'" class="cal-state hub-mono">Carregando eventos…</div>
      <div v-else-if="calendarState.status === 'error'" class="cal-state hub-mono">
        // Não foi possível carregar o calendário ({{ calendarState.error }}).
        <button class="hub-mono retry" @click="loadCalendar">tentar novamente</button>
      </div>

      <template v-else>
        <div v-if="!filteredEvents.length" class="cal-state hub-mono">Nenhum evento encontrado para esse filtro.</div>

        <div v-else-if="view === 'lista'" class="cal-list">
          <div v-for="(e, i) in filteredEvents" :key="e.date + e.title + i" class="cal-row" v-reveal="i % 12">
            <span class="hub-mono cal-row-date">{{ formatFull(e.date) }}</span>
            <span class="cal-row-title">{{ e.title }}</span>
            <span v-if="e.discipline" class="hub-mono cal-row-disc" :title="disciplineName(e.discipline)">{{ e.discipline }}</span>
            <span class="hub-mono cal-row-type" :class="'t-' + e.type">{{ typeLabels[e.type] || e.type }}</span>
          </div>
        </div>

        <div v-else class="cal-month">
          <div class="cal-month-nav">
            <button class="hub-pill" @click="shiftMonth(-1)">←</button>
            <span class="cal-month-label hub-mono">{{ monthLabel }}</span>
            <button class="hub-pill" @click="shiftMonth(1)">→</button>
          </div>
          <div class="cal-grid">
            <div v-for="(w, i) in WEEKDAYS" :key="i" class="cal-weekday hub-mono">{{ w }}</div>
            <div v-for="(cell, i) in monthCells" :key="i" class="cal-cell" :class="{ empty: !cell, filled: cell && cell.events.length }">
              <template v-if="cell">
                <span class="cal-cell-day hub-mono">{{ cell.day }}</span>
                <span v-if="cell.events.length" class="cal-cell-dot"></span>
              </template>
            </div>
          </div>
        </div>
      </template>
    </main>

    <site-footer></site-footer>
  </div>
</template>

<style scoped>
.cal-head {
  padding: 56px 0 24px;
}
.cal-head-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.cal-h1 {
  font-family: var(--hub-font-display);
  font-weight: 600;
  font-size: 42px;
  letter-spacing: -1px;
  margin: 0 0 10px;
}
.cal-sub {
  font-size: 17px;
  color: var(--hub-muted);
  margin: 0;
}

.cal-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 24px;
}
.cal-view-toggle,
.cal-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.cal-select {
  font-size: 12px;
  padding: 8px 12px;
  border: 1px solid var(--hub-line);
  border-radius: 3px;
  background: #fff;
  color: var(--hub-black);
  cursor: pointer;
}

.cal-body {
  padding-bottom: 64px;
  min-height: 40vh;
}
.cal-state {
  color: var(--hub-muted);
  font-size: 13px;
  line-height: 1.7;
  padding: 48px 0;
}
.retry {
  border: 1px solid var(--hub-line);
  background: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 8px;
  display: inline-block;
}

.cal-list {
  display: flex;
  flex-direction: column;
}
.cal-row {
  display: grid;
  grid-template-columns: 110px 1fr 90px 90px;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--hub-line-soft);
}
.cal-row-date {
  color: var(--hub-red);
  font-size: 13px;
}
.cal-row-title {
  font-size: 15px;
}
.cal-row-disc {
  font-size: 11px;
  color: var(--hub-muted);
}
.cal-row-type {
  font-size: 10px;
  letter-spacing: 0.5px;
  text-align: right;
  color: var(--hub-faint);
}
.cal-row-type.t-prova {
  color: var(--hub-red);
}

.cal-month-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.cal-month-label {
  font-size: 14px;
  min-width: 160px;
  text-align: center;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.cal-weekday {
  text-align: center;
  font-size: 10px;
  color: var(--hub-faint);
  padding: 6px 0;
}
.cal-cell {
  aspect-ratio: 1;
  border: 1px solid var(--hub-line-soft);
  border-radius: 3px;
  padding: 6px;
  position: relative;
}
.cal-cell.empty {
  border-color: transparent;
}
.cal-cell.filled {
  border-color: var(--hub-red);
  background: rgba(230, 48, 48, 0.05);
}
.cal-cell-day {
  font-size: 11px;
  color: var(--hub-muted);
}
.cal-cell-dot {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--hub-red);
}

@media (max-width: 640px) {
  .hub-wrap {
    padding: 0 20px;
  }
  .cal-row {
    grid-template-columns: 80px 1fr;
    row-gap: 4px;
  }
  .cal-row-disc,
  .cal-row-type {
    grid-column: 2;
    text-align: left;
  }
}
</style>
