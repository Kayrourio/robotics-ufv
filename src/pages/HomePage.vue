<script setup>
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { navigate } from '../router'
import { DISCIPLINES, EDGES, DEFAULT_MAX_PERIOD } from '../data'
import { sampleCards, typeBars, TYPES } from '../data/useArchive'
import { calendarState, loadCalendar } from '../data/calendar'
import SiteNav from '../components/hub/SiteNav.vue'
import SiteFooter from '../components/hub/SiteFooter.vue'

// three.js pesa ~170KB gzip — carregado async para não engordar o chunk
// principal (as outras rotas não usam)
const R2D2Blueprint = defineAsyncComponent(() => import('../components/hub/R2D2Blueprint.vue'))
import GraphPreview from '../components/hub/GraphPreview.vue'
import TelemetryStat from '../components/hub/TelemetryStat.vue'

const stats = computed(() => {
  const prereqCount = EDGES.filter((e) => !e.coreq).length
  const totalHours = DISCIPLINES.reduce((n, d) => n + d.hours, 0)
  const periods = Math.max(DEFAULT_MAX_PERIOD, ...DISCIPLINES.map((d) => d.period))
  return {
    disciplines: DISCIPLINES.length,
    prereqs: prereqCount,
    hours: totalHours,
    periods,
  }
})

const quickAccess = [
  { num: '01', title: 'Grafo', desc: 'Visualize todas as disciplinas e suas dependências.', path: '/grafo' },
  { num: '02', title: 'Archive', desc: 'Acesse materiais, provas e conteúdos da turma.', path: '/archive' },
  { num: '03', title: 'Calendário', desc: 'Fique por dentro dos eventos do semestre.', path: '/calendario' },
  { num: '04', title: 'Links', desc: 'Recursos úteis e serviços da UFV para você.', path: '/links' },
]

const previewCards = sampleCards(7)
const previewTypes = (d) => [...new Set(d.files.map((f) => f.type))]

const upcomingEvents = computed(() => calendarState.events.slice(0, 5))

const monthAbbr = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
function formatShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${String(d.getDate()).padStart(2, '0')} ${monthAbbr[d.getMonth()]}`
}

onMounted(loadCalendar)
</script>

<template>
  <div class="hub">
    <site-nav></site-nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-grid hub-wrap">
        <div class="hero-title-col">
          <div class="hub-eyebrow" v-reveal="0">UNIVERSIDADE FEDERAL DE VIÇOSA · ERO · 2026</div>
          <h1 class="hero-h1" v-reveal="1">Engenharia<br />de Robôs<span class="dot">.</span></h1>
          <div class="hero-tagline" v-reveal="2">Inovar. Projetar. Construir. <span class="dot">Transformar.</span></div>
          <div class="hero-rule" v-reveal="3"></div>
          <p class="hero-p" v-reveal="4">
            Um curso completo que integra mecânica, eletrônica, computação, inteligência artificial e
            controle para formar engenheiros capazes de criar robôs reais.
          </p>
          <div class="hero-actions" v-reveal="5">
            <button class="hub-btn primary" @click="navigate('/archive')">Explorar o curso <span>→</span></button>
            <button class="hub-btn ghost-dark" @click="navigate('/grafo')">Ver o grafo curricular</button>
          </div>
        </div>

        <div class="hero-stats-col">
          <telemetry-stat :value="stats.disciplines" label="DISCIPLINAS" :delay="0">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" /><path d="M3 7 L12 12 L21 7" /><path d="M12 12 V22" /></svg>
            </template>
          </telemetry-stat>
          <telemetry-stat :value="stats.hours" suffix="h" label="CARGA HORÁRIA" :delay="1">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 7 V12 L15.5 14" stroke-linecap="round" /></svg>
            </template>
          </telemetry-stat>
          <telemetry-stat :value="stats.periods" label="PERÍODOS" :delay="2">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 9.5 H20.5" /><path d="M8 3 V6.5" /><path d="M16 3 V6.5" /></svg>
            </template>
          </telemetry-stat>
        </div>

        <div class="hero-robot-col" v-reveal="3">
          <r2-d2-blueprint></r2-d2-blueprint>
        </div>
      </div>

      <div class="hero-strip hub-wrap">
        <span class="hub-mono">LAT -20.7546° · LON -42.8825° · UFV · VIÇOSA · MG · SISTEMA: ERO HUB v0.1</span>
      </div>
    </section>

    <!-- QUICK ACCESS -->
    <section class="quick">
      <div class="hub-wrap quick-grid">
        <button
          v-for="(q, i) in quickAccess"
          :key="q.path"
          class="quick-card hub-clickable"
          v-reveal="i"
          @click="navigate(q.path)"
        >
          <div class="quick-num hub-mono">{{ q.num }} —</div>
          <div class="quick-body">
            <span class="quick-icon">
              <svg v-if="q.path === '/grafo'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" /><circle cx="9" cy="10.5" r="1.5" /><circle cx="15.5" cy="9" r="1.5" /><circle cx="12" cy="15.5" r="1.5" /><path d="M9.4 9.7 L15.1 9.1 M9.5 11.8 L11.6 14.4 M14.9 10 L12.5 14.3" /></svg>
              <svg v-else-if="q.path === '/archive'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3 6.5 a2 2 0 0 1 2-2 h4 l2 2 h8 a2 2 0 0 1 2 2 v7 a2 2 0 0 1-2 2 H5 a2 2 0 0 1-2-2 Z" /></svg>
              <svg v-else-if="q.path === '/calendario'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 9.5 H20.5" /><path d="M8 3 V6.5" /><path d="M16 3 V6.5" /><path d="M7.5 13 H9 M11.2 13 H12.7 M15 13 H16.5 M7.5 16.5 H9 M11.2 16.5 H12.7" /></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 15 L15 9" /><path d="M10.5 6.7 l1.6-1.6 a3.6 3.6 0 0 1 5.1 5.1 l-1.6 1.6" /><path d="M13.5 17.3 l-1.6 1.6 a3.6 3.6 0 0 1-5.1-5.1 l1.6-1.6" /></svg>
            </span>
            <div>
              <div class="quick-title">{{ q.title }}</div>
              <div class="quick-desc">{{ q.desc }}</div>
            </div>
          </div>
        </button>
      </div>
    </section>

    <!-- ARCHIVE PREVIEW -->
    <section class="section-light">
      <div class="hub-wrap">
        <div class="section-head" v-reveal="0">
          <div>
            <div class="hub-eyebrow">02 — ERO ARCHIVE</div>
            <h2 class="section-h2">Material de todas as disciplinas, em um lugar.</h2>
          </div>
          <span class="hub-mono badge">BETA · CONSTRUINDO</span>
        </div>
        <div class="archive-grid">
          <div
            v-for="(c, i) in previewCards"
            :key="c.code"
            class="archive-card hub-scan-card hub-lift"
            v-reveal="i"
          >
            <div class="archive-card-code hub-mono">{{ c.code }}</div>
            <div class="archive-card-name">{{ c.name }}</div>
            <div class="archive-card-files hub-mono">{{ c.files.length }} arquivos</div>
            <div class="archive-card-types">
              <span v-for="t in previewTypes(c)" :key="t" class="type-tag hub-mono">{{ t }}</span>
            </div>
          </div>
          <button class="archive-cta hub-clickable" v-reveal="previewCards.length" @click="navigate('/archive')">
            <span class="hub-mono">+ Contribuir<br />com material →</span>
          </button>
        </div>
      </div>
    </section>

    <!-- GRAPH -->
    <section class="section-white">
      <div class="hub-wrap graph-grid">
        <div v-reveal="0"><graph-preview></graph-preview></div>
        <div class="graph-copy">
          <span class="ghost-number" aria-hidden="true">{{ stats.prereqs }}</span>
          <div class="graph-copy-inner" v-reveal="1">
            <div class="hub-eyebrow">01 — GRAFO DE DEPENDÊNCIAS</div>
            <h2 class="section-h2">Veja o que cada<br />disciplina desbloqueia.</h2>
            <p class="section-p">
              Todas as disciplinas do curso mapeadas em um só canvas. Selecione qualquer nó e veja a
              cadeia completa que ela destrava.
            </p>
            <div class="graph-facts hub-mono">
              <span><span class="red">→</span> {{ stats.disciplines }} disciplinas mapeadas</span>
              <span><span class="red">→</span> Arrastar e reorganizar livremente</span>
              <span><span class="red">→</span> Cadeia completa de bloqueio visível</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CALENDAR -->
    <section class="section-black">
      <div class="hub-wrap calendar-grid">
        <div v-reveal="0">
          <div class="hub-eyebrow">03 — CALENDÁRIO</div>
          <h2 class="section-h2 on-dark">Provas, entregas<br />e eventos do semestre.</h2>
        </div>
        <div class="calendar-list" v-reveal="1">
          <div class="calendar-head hub-mono">
            <span>// PRÓXIMOS EVENTOS</span>
            <div class="calendar-head-rule"></div>
          </div>
          <div v-if="calendarState.status === 'ready' && upcomingEvents.length">
            <div v-for="e in upcomingEvents" :key="e.date + e.title" class="calendar-row">
              <span class="calendar-date hub-mono">{{ formatShort(e.date) }}</span>
              <span class="calendar-title">{{ e.title }}</span>
            </div>
          </div>
          <div v-else-if="calendarState.status === 'loading'" class="calendar-empty hub-mono">Carregando eventos…</div>
          <div v-else-if="calendarState.status === 'unconfigured'" class="calendar-empty hub-mono">
            Calendário ainda não configurado — veja /calendario para detalhes.
          </div>
          <div v-else class="calendar-empty hub-mono">Nenhum evento próximo.</div>
          <div class="calendar-more">
            <span class="hub-clickable" @click="navigate('/calendario')">Ver calendário completo →</span>
          </div>
        </div>
      </div>
    </section>

    <site-footer></site-footer>
  </div>
</template>

<style scoped>
.hero {
  background: var(--hub-black);
  position: relative;
  overflow: hidden;
  margin-top: 2px;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 44px 44px;
  pointer-events: none;
}
.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1.2fr 0.62fr 1fr;
  align-items: center;
  gap: 36px;
  padding: 58px 0 62px;
}
.hero-stats-col {
  justify-self: start;
  min-width: 210px;
}
.hero-h1 {
  font-family: var(--hub-font-display);
  font-weight: 700;
  font-size: 72px;
  line-height: 0.98;
  letter-spacing: -2.5px;
  color: var(--hub-off);
  margin: 0;
}
.hero-h1 .dot {
  color: var(--hub-red);
}
.hero-tagline {
  font-family: var(--hub-font-display);
  font-size: 22px;
  font-weight: 500;
  color: var(--hub-off);
  margin: 22px 0 0;
}
.hero-tagline .dot {
  color: var(--hub-red);
}
.hero-rule {
  width: 80px;
  height: 3px;
  background: var(--hub-red);
  margin: 26px 0;
}
.hero-p {
  font-size: 16px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.55);
  max-width: 440px;
  margin: 0 0 34px;
}
.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.hero-strip {
  border-top: 1px solid #d4d4d4;
  padding: 12px 0;
}
.hero-strip span {
  font-size: 11px;
  letter-spacing: 1px;
  color: #9a9a9a;
}

/* quick access */
.quick {
  background: var(--hub-black);
}
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.quick-card {
  padding: 44px 34px;
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  background: none;
  border-top: none;
  border-right: none;
  border-bottom: none;
  text-align: left;
  color: inherit;
  font: inherit;
  transition: background 200ms;
}
.quick-card:first-child {
  border-left: none;
}
.quick-card:hover {
  background: rgba(255, 255, 255, 0.03);
}
.quick-num {
  font-size: 13px;
  color: var(--hub-red);
  margin-bottom: 24px;
}
.quick-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.quick-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  color: var(--hub-red);
  display: block;
}
.quick-icon svg {
  width: 100%;
  height: 100%;
}
.quick-title {
  font-family: var(--hub-font-display);
  font-size: 21px;
  font-weight: 600;
  color: var(--hub-off);
  margin-bottom: 6px;
}
.quick-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
}

/* archive preview */
.section-light {
  background: var(--hub-off-2);
  padding: 64px 0;
}
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}
.section-h2 {
  font-family: var(--hub-font-display);
  font-weight: 600;
  font-size: 38px;
  letter-spacing: -1px;
  margin: 14px 0 0;
  max-width: 640px;
}
.section-h2.on-dark {
  color: var(--hub-off);
}
.badge {
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--hub-black);
  border: 1px solid var(--hub-black);
  padding: 6px 12px;
  border-radius: 3px;
  white-space: nowrap;
}
.archive-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.archive-card {
  background: #fff;
  border: 1px solid var(--hub-line);
  border-radius: 4px;
  padding: 22px;
}
.archive-card-code {
  font-size: 14px;
  color: var(--hub-red);
  font-weight: 500;
  margin-bottom: 12px;
}
.archive-card-name {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
  min-height: 40px;
  margin-bottom: 12px;
}
.archive-card-files {
  font-size: 11px;
  color: var(--hub-faint);
  margin-bottom: 14px;
}
.archive-card-types {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.type-tag {
  font-size: 9px;
  letter-spacing: 0.5px;
  color: var(--hub-muted);
  border: 1px solid var(--hub-line);
  padding: 2px 7px;
  border-radius: 2px;
}
.archive-cta {
  background: var(--hub-black);
  border: none;
  border-radius: 4px;
  padding: 22px;
  display: flex;
  align-items: flex-end;
  cursor: pointer;
  color: var(--hub-off);
  text-align: left;
  transition: background 150ms;
}
.archive-cta:hover {
  background: #1c1c1c;
}
.archive-cta span {
  font-size: 14px;
  line-height: 1.4;
}

/* graph section */
.section-white {
  background: var(--hub-off);
  padding: 64px 0;
}
.graph-grid {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 52px;
  align-items: center;
}
.graph-copy {
  position: relative;
}
.ghost-number {
  position: absolute;
  right: 0;
  top: -70px;
  font-family: var(--hub-font-display);
  font-weight: 700;
  font-size: 190px;
  line-height: 1;
  color: rgba(15, 15, 15, 0.05);
  z-index: 0;
  user-select: none;
}
.graph-copy-inner {
  position: relative;
  z-index: 1;
}
.section-p {
  font-size: 16px;
  line-height: 1.55;
  color: var(--hub-muted);
  max-width: 460px;
  margin: 18px 0 26px;
}
.graph-facts {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  color: var(--hub-black);
}
.graph-facts .red {
  color: var(--hub-red);
}

/* calendar section */
.section-black {
  background: var(--hub-black);
  padding: 64px 0;
}
.calendar-grid {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 52px;
  align-items: center;
}
.calendar-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.calendar-head span {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  white-space: nowrap;
}
.calendar-head-rule {
  flex: 1;
  border-top: 1px dashed rgba(255, 255, 255, 0.2);
}
.calendar-row {
  display: flex;
  gap: 22px;
  padding: 13px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.calendar-date {
  color: var(--hub-red);
  font-size: 13px;
  width: 56px;
  flex-shrink: 0;
}
.calendar-title {
  color: var(--hub-off);
  font-size: 14px;
}
.calendar-empty {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  padding: 13px 0;
}
.calendar-more {
  margin-top: 22px;
}
.calendar-more span {
  font-size: 13px;
  color: var(--hub-off);
  cursor: pointer;
}
.calendar-more span:hover {
  color: var(--hub-red);
}

@media (max-width: 1100px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
  .hero-robot-col {
    max-width: 340px;
    width: 100%;
    margin: 8px auto 0;
  }
  .hero-stats-col {
    justify-self: stretch;
  }
  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .quick-card:nth-child(2) {
    border-left: none;
  }
  .archive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .graph-grid,
  .calendar-grid {
    grid-template-columns: 1fr;
  }
  .ghost-number {
    display: none;
  }
}
@media (max-width: 640px) {
  .hub-wrap {
    padding: 0 20px;
  }
  .hero-h1 {
    font-size: 48px;
  }
  .quick-grid {
    grid-template-columns: 1fr;
  }
  .quick-card:nth-child(2) {
    border-left: 1px solid rgba(255, 255, 255, 0.15);
  }
  .archive-grid {
    grid-template-columns: 1fr;
  }
}
</style>
