<template>
  <div class="theme-switcher">
    <span style="font-weight: 700; font-size: 0.9rem;">Theme:</span>
    <div
      v-for="name in themeNames"
      :key="name"
      class="theme-dot"
      :class="{ active: current === name }"
      :style="{ backgroundColor: dotColors[name] }"
      :title="name"
      @click="setTheme(name)"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore, themeNames } from '../stores/theme'

const themeStore = useThemeStore()
const current = computed(() => themeStore.current)

const dotColors = {
  coral: '#ff6b6b',
  sky: '#4a90d9',
  violet: '#9b5de5',
  mint: '#2a9d8f',
}

function setTheme(name) {
  themeStore.setTheme(name)
}
</script>