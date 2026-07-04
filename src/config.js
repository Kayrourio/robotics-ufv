// Fontes de dados externas do hub. Definidas via .env (veja .env.example) —
// nunca hardcoded, para que o time consiga trocar a planilha/form sem tocar
// em código.
export const CALENDAR_SHEET_CSV_URL = import.meta.env.VITE_CALENDAR_SHEET_CSV_URL || ''
export const CONTRIBUTE_FORM_URL = import.meta.env.VITE_CONTRIBUTE_FORM_URL || ''
