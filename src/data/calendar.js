import { reactive } from 'vue'
import { CALENDAR_SHEET_CSV_URL } from '../config'

export const EVENT_TYPES = ['prova', 'entrega', 'evento', 'prazo']

export const calendarState = reactive({
  events: [],
  status: CALENDAR_SHEET_CSV_URL ? 'loading' : 'unconfigured', // loading | ready | error | unconfigured
  error: null,
})

// Parser CSV mínimo: aceita campos entre aspas com vírgulas/quebras de linha
// escapadas como "" — suficiente para uma exportação padrão do Sheets.
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ''))
}

function toEvents(rows) {
  if (!rows.length) return []
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = (name) => header.indexOf(name)
  const dateI = idx('date')
  const titleI = idx('title')
  const typeI = idx('type')
  const discI = idx('discipline')
  return rows
    .slice(1)
    .map((r) => ({
      date: (r[dateI] || '').trim(),
      title: (r[titleI] || '').trim(),
      type: (r[typeI] || 'evento').trim().toLowerCase(),
      discipline: (r[discI] || '').trim(),
    }))
    .filter((e) => e.date && e.title && !Number.isNaN(Date.parse(e.date)))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function loadCalendar() {
  if (!CALENDAR_SHEET_CSV_URL) {
    calendarState.status = 'unconfigured'
    return
  }
  calendarState.status = 'loading'
  calendarState.error = null
  try {
    const res = await fetch(CALENDAR_SHEET_CSV_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    calendarState.events = toEvents(parseCsv(text))
    calendarState.status = 'ready'
  } catch (err) {
    calendarState.status = 'error'
    calendarState.error = err.message || String(err)
  }
}
