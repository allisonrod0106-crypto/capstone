<template>
  <div>
    <h1>Today's Journal</h1>

    <div v-if="loading">Loading your prompt...</div>

    <div v-else-if="error" style="color: red;">{{ error }}</div>

    <div v-else>
      <p><strong>Today's prompt:</strong> {{ prompt }}</p>

      <textarea
        v-model="response"
        placeholder="Write your response here..."
        rows="8"
        cols="50"
      ></textarea>

      <br />

      <p v-if="submitError" style="color: red;">{{ submitError }}</p>
      <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>

      <button @click="handleSubmit" :disabled="submitting">
        {{ submitting ? 'Saving...' : 'Save Entry' }}
      </button>
    </div>

    <br />
    <RouterLink to="/history">View past entries</RouterLink>
    |
    <button @click="handleLogout">Log out</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const prompt = ref('')
const response = ref('')
const loading = ref(true)
const error = ref(null)
const submitting = ref(false)
const submitError = ref(null)
const successMessage = ref(null)

onMounted(async () => {
  try {
    const res = await api.get('/api/prompts/daily')
    prompt.value = res.data.prompt.text
  } catch (err) {
    error.value = 'Failed to load prompt. Make sure the backend is running.'
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  if (!response.value.trim()) {
    submitError.value = 'Please write something before saving.'
    return
  }
  submitError.value = null
  successMessage.value = null
  submitting.value = true
  try {
    await api.post('/api/entries', {
      prompt: prompt.value,
      response: response.value,
    })
    successMessage.value = 'Entry saved!'
    response.value = ''
  } catch (err) {
    submitError.value = err.response?.data?.error || 'Failed to save entry.'
  } finally {
    submitting.value = false
  }
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>