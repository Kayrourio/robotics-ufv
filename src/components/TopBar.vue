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
    <div class="brand">
      <span class="title">ERO · UFV</span>
      <span class="subtitle">{{ t('subtitle') }}</span>
    </div>
    <div class="search-wrap">
      <input type="text" :placeholder="t('search')" v-model="store.search" @input="onSearchInput" />
    </div>
    <div class="spacer"></div>
    <button @click="zoomFit">{{ t('fit') }} (F)</button>
    <button @click="resetLayout">{{ t('reset') }} (R)</button>
    <button @click="toggleLocale">{{ store.locale === 'pt' ? 'EN' : 'PT' }}</button>
  </div>
</template>
