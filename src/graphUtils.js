import { DISCIPLINE_MAP, NODE_W } from './data'

export const graphUtils = {
  getPrereqSet(code, disciplines) {
    const d = disciplines.find((x) => x.code === code)
    if (!d) return new Set()
    return new Set([...d.prereqs, ...d.coreqs])
  },

  getDirectDependents(code, disciplines) {
    return new Set(
      disciplines.filter((d) => d.prereqs.includes(code) || d.coreqs.includes(code)).map((d) => d.code),
    )
  },

  getTransitiveDependents(code, disciplines) {
    const result = new Set()
    const queue = [code]
    while (queue.length) {
      const cur = queue.shift()
      disciplines.forEach((d) => {
        if (
          !result.has(d.code) &&
          d.code !== code &&
          (d.prereqs.includes(cur) || d.coreqs.includes(cur))
        ) {
          result.add(d.code)
          queue.push(d.code)
        }
      })
    }
    return result
  },

  getImpactLevel(count) {
    if (count >= 8) return 'high'
    if (count >= 4) return 'med'
    return 'low'
  },

  getNodeState(code, store, searchActive) {
    if (searchActive) {
      const q = store.search.toLowerCase()
      const d = DISCIPLINE_MAP[code]
      return code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)
        ? 'search-match'
        : 'search-dim'
    }
    if (!store.selected) return 'default'
    if (code === store.selected) return 'selected'
    if (store.prereqSet.has(code)) return 'prereq'
    if (store.directDependents.has(code)) return 'dep-direct'
    if (store.transitiveDependents.has(code)) return 'dep-transitive'
    return 'dimmed'
  },

  getEdgeState(from, to, isCoreq, store) {
    if (!store.selected) return 'inactive'
    const sel = store.selected
    if (to === sel && store.prereqSet.has(from)) return isCoreq ? 'coreq-active' : 'prereq-active'
    if (from === sel && store.directDependents.has(to)) return 'dep-direct-active'
    if (from === sel && store.transitiveDependents.has(to)) return 'dep-trans-active'
    if (store.transitiveDependents.has(from) && store.transitiveDependents.has(to)) return 'dep-trans-active'
    return 'inactive'
  },

  bezierPath(x1, y1, x2, y2) {
    const sx = x1 + NODE_W,
      sy = y1 + 32
    const tx = x2,
      ty = y2 + 32
    const cp = Math.max(80, (tx - sx) * 0.4)
    return `M ${sx} ${sy} C ${sx + cp} ${sy}, ${tx - cp} ${ty}, ${tx} ${ty}`
  },
}

export const EDGE_STYLES = {
  inactive: { stroke: 'rgba(240,240,240,0.05)', width: 1, dash: '', marker: 'arrow-inactive' },
  'prereq-active': { stroke: '#e63030', width: 2, dash: '', marker: 'arrow-active' },
  'coreq-active': { stroke: 'rgba(230,48,48,0.75)', width: 1.5, dash: '5 3', marker: 'arrow-active-dim' },
  'dep-direct-active': { stroke: 'rgba(230,48,48,0.85)', width: 1.5, dash: '', marker: 'arrow-active' },
  'dep-trans-active': { stroke: 'rgba(230,48,48,0.35)', width: 1, dash: '', marker: 'arrow-active-dim' },
}
