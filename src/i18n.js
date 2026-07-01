import { store } from './store'

export const messages = {
  pt: {
    subtitle: 'Grade Curricular 2026',
    search: '_ buscar disciplina',
    reset: 'Reset Layout',
    fit: 'Zoom Fit',
    panelTitle: '// Disciplina Selecionada',
    prereqs: '// Pré-Requisitos',
    blocked: '// Bloqueadas em Cadeia',
    noSelection: 'Clique em um nó para ver dependências',
    escHint: 'ESC para fechar · clique em outro nó para comparar',
    impactHigh: 'Alto Impacto',
    impactMed: 'Médio Impacto',
    impactLow: 'Baixo Impacto',
    tagPre: 'PRÉ',
    tagCo: 'CO',
    period: 'Período',
    hours: 'h',
    credits: 'créditos',
    bloqueadas: 'bloqueadas',
    footer: 'disciplinas · {p} períodos · ERO/UFV 2026',
    statusSelected: '{code} selecionada · {n} dependentes · {m} pré-requisitos',
    statusNone: 'Nenhuma disciplina selecionada',
  },
  en: {
    subtitle: 'Curriculum 2026',
    search: '_ search discipline',
    reset: 'Reset Layout',
    fit: 'Zoom Fit',
    panelTitle: '// Selected Discipline',
    prereqs: '// Prerequisites',
    blocked: '// Blocked in Chain',
    noSelection: 'Click a node to see dependencies',
    escHint: 'ESC to close · click another node to compare',
    impactHigh: 'High Impact',
    impactMed: 'Medium Impact',
    impactLow: 'Low Impact',
    tagPre: 'PRE',
    tagCo: 'CO',
    period: 'Period',
    hours: 'h',
    credits: 'credits',
    bloqueadas: 'blocked',
    footer: 'disciplines · {p} periods · ERO/UFV 2026',
    statusSelected: '{code} selected · {n} dependents · {m} prerequisites',
    statusNone: 'No discipline selected',
  },
}

export function t(key, vars = {}) {
  let str = messages[store.locale][key] || key
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(`{${k}}`, v)
  })
  return str
}
