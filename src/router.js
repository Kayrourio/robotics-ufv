import { reactive } from 'vue'

// Router mínimo em history mode. vue-router não entra por conflito de peer
// deps com o vue beta; para 5 rotas estáticas isso cobre tudo que precisamos
// e dá controle total sobre a transição de página (wipe).
export const PATHS = ['/', '/archive', '/calendario', '/links', '/grafo']

function normalize(p) {
  if (!p) return '/'
  let path = p.split('?')[0].split('#')[0]
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  return PATHS.includes(path) ? path : '/'
}

export const route = reactive({
  path: normalize(window.location.pathname),
  // fase da transição: 'idle' | 'cover' | 'reveal'
  wipe: 'idle',
})

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

let navigating = false

export async function navigate(path, { replace = false } = {}) {
  const target = normalize(path)
  if (target === route.path || navigating) return
  navigating = true

  if (!reducedMotion()) {
    route.wipe = 'cover'
    await wait(420)
  }

  window.history[replace ? 'replaceState' : 'pushState']({}, '', target)
  route.path = target
  window.scrollTo(0, 0)

  if (!reducedMotion()) {
    await wait(40)
    route.wipe = 'reveal'
    await wait(460)
  }
  route.wipe = 'idle'
  navigating = false
}

window.addEventListener('popstate', () => {
  route.path = normalize(window.location.pathname)
  window.scrollTo(0, 0)
})
