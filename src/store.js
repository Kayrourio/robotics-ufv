import { reactive } from 'vue'

export const store = reactive({
  selected: null,
  search: '',
  sidePanelOpen: false,
  locale: 'pt',

  prereqSet: new Set(),
  directDependents: new Set(),
  transitiveDependents: new Set(),
  impactLevel: 'low',
})
