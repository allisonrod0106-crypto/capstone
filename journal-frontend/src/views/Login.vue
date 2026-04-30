<template>
  <div>
    <h1>Log In</h1>

    <form @submit.prevent="handleSubmit">
      <div>
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="Email" required />
      </div>

      <div>
        <label>Password</label>
        <input v-model="form.password" type="password" placeholder="Password" required />
      </div>

      <p v-if="error" style="color: red;">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Log In' }}
      </button>
    </form>

    <p>Don't have an account? <RouterLink to="/register">Register</RouterLink></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ email: '', password: '' })
const error = ref(null)
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    await auth.login(form.value)
    router.push('/journal')
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong.'
  } finally {
    loading.value = false
  }
}
</script>