<script setup>
import { computed, ref } from 'vue'
import { navigate } from '../router'
import linkGroups from '../data/links.json'
import SiteNav from '../components/hub/SiteNav.vue'
import SiteFooter from '../components/hub/SiteFooter.vue'

const search = ref('')

const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return linkGroups
  return linkGroups
    .map((g) => ({
      ...g,
      links: g.links.filter(
        (l) => l.label.toLowerCase().includes(q) || l.description.toLowerCase().includes(q),
      ),
    }))
    .filter((g) => g.links.length)
})

function isInternal(url) {
  return url.startsWith('/')
}

function open(link) {
  if (!link.url) return
  if (isInternal(link.url)) navigate(link.url)
  else window.open(link.url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="hub">
    <site-nav></site-nav>

    <header class="lk-head hub-wrap">
      <div class="hub-eyebrow" v-reveal="0">04 — LINKS ÚTEIS</div>
      <h1 class="lk-h1" v-reveal="1">Recursos e serviços, num só lugar.</h1>
      <p class="lk-sub" v-reveal="2">Portal do aluno, biblioteca, ferramentas de estudo e contatos do curso.</p>

      <div class="lk-search hub-search-box" v-reveal="3">
        <span class="hub-mono search-ph" :class="{ hidden: search }">_ buscar link...</span>
        <input v-model="search" type="text" class="lk-search-input hub-mono" aria-label="Buscar links" />
        <span class="hub-caret" :class="{ hidden: search }" aria-hidden="true"></span>
      </div>
    </header>

    <main class="lk-body hub-wrap">
      <div v-if="!filteredGroups.length" class="lk-empty hub-mono">Nenhum link encontrado.</div>

      <section v-for="g in filteredGroups" :key="g.category" class="lk-group">
        <div class="lk-group-head" v-reveal="0">
          <span class="lk-group-title">{{ g.category }}</span>
          <div class="lk-group-rule"></div>
        </div>
        <div class="lk-grid">
          <button
            v-for="(l, i) in g.links"
            :key="l.label"
            class="lk-card hub-scan-card hub-clickable hub-lift"
            :class="{ disabled: !l.url }"
            v-reveal="i"
            @click="open(l)"
          >
            <div class="lk-card-label">{{ l.label }}</div>
            <div class="lk-card-desc">{{ l.description }}</div>
            <span v-if="l.url" class="lk-card-arrow" aria-hidden="true">{{ isInternal(l.url) ? '→' : '↗' }}</span>
            <span v-else class="lk-card-soon hub-mono">em breve</span>
          </button>
        </div>
      </section>
    </main>

    <site-footer></site-footer>
  </div>
</template>

<style scoped>
.lk-head {
  padding: 56px 0 32px;
}
.lk-h1 {
  font-family: var(--hub-font-display);
  font-weight: 600;
  font-size: 42px;
  letter-spacing: -1px;
  margin: 14px 0 10px;
}
.lk-sub {
  font-size: 17px;
  color: var(--hub-muted);
  margin: 0 0 28px;
  max-width: 560px;
}
.lk-search {
  max-width: 480px;
}
.search-ph {
  position: absolute;
  left: 18px;
  font-size: 16px;
  color: var(--hub-faint);
  pointer-events: none;
  transition: opacity 120ms;
}
.search-ph.hidden {
  opacity: 0;
}
.hub-caret.hidden {
  display: none;
}
.lk-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  font-size: 16px;
  color: var(--hub-black);
  position: relative;
  z-index: 1;
}

.lk-body {
  padding-bottom: 64px;
}
.lk-empty {
  color: var(--hub-faint);
  padding: 40px 0;
  font-size: 13px;
}
.lk-group {
  margin-bottom: 40px;
}
.lk-group-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}
.lk-group-title {
  font-family: var(--hub-font-display);
  font-size: 20px;
  font-weight: 600;
}
.lk-group-rule {
  flex: 1;
  height: 1px;
  background: var(--hub-line);
}
.lk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.lk-card {
  position: relative;
  text-align: left;
  background: #fff;
  border: 1px solid var(--hub-line);
  border-radius: 4px;
  padding: 20px 88px 20px 20px;
  cursor: pointer;
  font: inherit;
  color: inherit;
}
.lk-card:hover {
  border-color: var(--hub-red);
}
.lk-card.disabled {
  cursor: default;
  opacity: 0.55;
}
.lk-card.disabled:hover {
  border-color: var(--hub-line);
}
.lk-card-label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}
.lk-card-desc {
  font-size: 12.5px;
  color: var(--hub-muted);
  line-height: 1.4;
}
.lk-card-arrow {
  position: absolute;
  top: 18px;
  right: 18px;
  color: var(--hub-red);
  font-size: 14px;
}
.lk-card-soon {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 9px;
  letter-spacing: 0.5px;
  color: var(--hub-faint);
  border: 1px solid var(--hub-line);
  padding: 3px 7px;
  border-radius: 2px;
}

@media (max-width: 900px) {
  .lk-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .hub-wrap {
    padding: 0 20px;
  }
  .lk-grid {
    grid-template-columns: 1fr;
  }
  .lk-h1 {
    font-size: 30px;
  }
}
</style>
