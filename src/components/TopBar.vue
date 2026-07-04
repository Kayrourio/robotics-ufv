<script setup>
import { store } from '../store'
import { t } from '../i18n'
import { zoomFit, resetLayout, applyNodeStates } from '../canvasEngine'

function onSearchInput() {
  applyNodeStates()
}

function toggleLocale() {
  store.locale = store.locale === 'pt' ? 'en' : 'pt'
}
</script>

<template>
  <div id="top-bar">
    <div class="hub-wrap top-bar-inner">
      <span class="subtitle">{{ t('subtitle') }}</span>
      <div class="search-wrap">
        <input type="text" :placeholder="t('search')" v-model="store.search" @input="onSearchInput" />
      </div>
      <div class="spacer"></div>
      <div class="tb-actions">
        <button @click="zoomFit">{{ t('fit') }}<span class="kbd-hint"> (F)</span></button>
        <button @click="resetLayout">{{ t('reset') }}<span class="kbd-hint"> (R)</span></button>
        <button @click="toggleLocale">{{ store.locale === 'pt' ? 'EN' : 'PT' }}</button>
      </div>
    </div>
  </div>
</template>
