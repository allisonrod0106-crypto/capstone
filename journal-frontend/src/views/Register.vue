<template>
  <div class="page">
    <h1>📓 Daily Journal</h1>
    <h2>Create Account</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Username</label>
        <input v-model="form.username" type="text" placeholder="Your username" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="you@example.com" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input v-model="form.password" type="password" placeholder="Min 8 characters" required />
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating account...' : 'Register' }}
      </button>
    </form>

    <div class="divider">——</div>
    <p>Already have an account? <RouterLink to="/login">Log in</RouterLink></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const form = ref({ username: '', email: '', password: '' })
const error = ref(null)
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    await auth.register(form.value)
    router.push('/journal')
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong.'
  } finally {
    loading.value = false
  }
}
</script>