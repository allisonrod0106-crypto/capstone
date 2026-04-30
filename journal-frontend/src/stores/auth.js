import { defineStore } from 'pinia'
import api from '../api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async register(data) {
      const response = await api.post('/api/users/register', data)
      this.token = response.data.token
      this.user = response.data.user
      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    async login(data) {
      const response = await api.post('/api/users/login', data)
      this.token = response.data.token
      this.user = response.data.user
      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})