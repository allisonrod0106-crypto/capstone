import { defineStore } from 'pinia'

const themes = {
  coral: {
    '--color-primary': '#ff6b6b',
    '--color-primary-hover': '#ff4f4f',
    '--color-primary-light': '#fff0f0',
    '--color-primary-border': '#ffd6d6',
    '--color-accent': '#ffb347',
    '--color-accent-bg': '#fff3e0',
    '--color-bg': '#fffbf5',
  },
  sky: {
    '--color-primary': '#4a90d9',
    '--color-primary-hover': '#2f78c5',
    '--color-primary-light': '#eef5fd',
    '--color-primary-border': '#b3d4f5',
    '--color-accent': '#38c9b0',
    '--color-accent-bg': '#e6f9f6',
    '--color-bg': '#f5faff',
  },
  violet: {
    '--color-primary': '#9b5de5',
    '--color-primary-hover': '#7d3fcb',
    '--color-primary-light': '#f5eeff',
    '--color-primary-border': '#dbbfff',
    '--color-accent': '#f15bb5',
    '--color-accent-bg': '#fef0f8',
    '--color-bg': '#faf7ff',
  },
  mint: {
    '--color-primary': '#2a9d8f',
    '--color-primary-hover': '#1f7a6e',
    '--color-primary-light': '#e6f7f5',
    '--color-primary-border': '#a8ddd8',
    '--color-accent': '#e9c46a',
    '--color-accent-bg': '#fdf6e3',
    '--color-bg': '#f4fdfb',
  },
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    current: localStorage.getItem('theme') || 'coral',
  }),

  actions: {
    setTheme(name) {
      this.current = name
      localStorage.setItem('theme', name)
      applyTheme(name)
    },

    init() {
      applyTheme(this.current)
    },
  },
})

function applyTheme(name) {
  const theme = themes[name]
  if (!theme) return
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(key, value)
  }
}

export const themeNames = Object.keys(themes)