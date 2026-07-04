function pad(n) {
  return String(n).padStart(2, '0')
}

function dateStamp(d) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`
}

function escapeText(s) {
  return String(s).replace(/[\\,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n')
}

// Eventos do calendário são "dia inteiro" — sem horário na planilha —,
// então usamos VALUE=DATE com DTEND no dia seguinte (padrão iCalendar).
export function buildIcs(events) {
  const now = dateStamp(new Date())
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Robotica Hub//Calendario//PT', 'CALSCALE:GREGORIAN']
  events.forEach((e, i) => {
    const start = new Date(e.date + 'T00:00:00Z')
    if (Number.isNaN(start.getTime())) return
    const end = new Date(start.getTime() + 86400000)
    const description = [e.discipline, e.description].filter(Boolean).join(' — ')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${now}-${i}@robotica-hub`,
      `DTSTAMP:${now}T000000Z`,
      `DTSTART;VALUE=DATE:${dateStamp(start)}`,
      `DTEND;VALUE=DATE:${dateStamp(end)}`,
      `SUMMARY:${escapeText(e.title)}`,
      description ? `DESCRIPTION:${escapeText(description)}` : null,
      e.type ? `CATEGORIES:${escapeText(e.type.toUpperCase())}` : null,
      'END:VEVENT',
    )
  })
  lines.push('END:VCALENDAR')
  return lines.filter(Boolean).join('\r\n')
}

export function downloadIcs(events, filename = 'robotica-hub-calendario.ics') {
  const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
