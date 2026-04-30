<template>
  <div>
    <h1>Create Account</h1>

    <form @submit.prevent="handleSubmit">
      <div>
        <label>Username</label>
        <input v-model="form.username" type="text" placeholder="Username" required />
      </div>

      <div>
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="Email" required />
      </div>

      <div>
        <label>Password</label>
        <input v-model="form.password" type="password" placeholder="Password (min 8 chars)" required />
      </div>

      <p v-if="error" style="color: red;">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating account...' : 'Register' }}
      </button>
    </form>

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