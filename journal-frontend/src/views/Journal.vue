<template>
  <div class="page">
    <ThemeSwitcher />

    <div class="nav">
      <h1>📓 Daily Journal</h1>
      <button class="secondary" @click="handleLogout">Log out</button>
    </div>

    <div v-if="loading">Loading your prompt...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>

    <div v-else>

      <!-- ── Daily Prompt ────────────────────────── -->
      <div class="prompt-box">
        <p>✨ {{ prompt }}</p>
      </div>

      <div class="form-group">
        <label>Your response</label>
        <textarea v-model="response" placeholder="Start writing..."></textarea>
      </div>

      <!-- ── Gratitudes ──────────────────────────── -->
      <div class="card">
        <h2>🙏 Gratitudes</h2>
        <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 12px;">
          What are you grateful for today?
        </p>

        <div
          v-for="(item, index) in gratitudes"
          :key="index"
          class="list-row"
        >
          <input
            v-model="gratitudes[index]"
            type="text"
            :placeholder="`Gratitude ${index + 1}`"
          />
          <button class="remove-btn" @click="removeGratitude(index)">✕</button>
        </div>

        <button class="secondary" @click="addGratitude" :disabled="gratitudes.length >= 5">
          + Add Gratitude
        </button>
      </div>

      <!-- ── Goals ──────────────────────────────── -->
      <div class="card">
        <h2>🎯 Goals</h2>
        <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 12px;">
          What do you want to accomplish today?
        </p>

        <div
          v-for="(item, index) in goals"
          :key="index"
          class="list-row"
        >
          <input
            v-model="goals[index]"
            type="text"
            :placeholder="`Goal ${index + 1}`"
          />
          <button class="remove-btn" @click="removeGoal(index)">✕</button>
        </div>

        <button class="secondary" @click="addGoal" :disabled="goals.length >= 5">
          + Add Goal
        </button>
      </div>

      <p v-if="submitError" class="error-msg">{{ submitError }}</p>
      <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>

      <button @click="handleSubmit" :disabled="submitting">
        {{ submitting ? 'Saving...' : 'Save Entry' }}
      </button>
      <RouterLink to="/history">
        <button class="secondary">View History</button>
      </RouterLink>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'
import { useAuthStore } from '../stores/auth'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'

const router = useRouter()
const auth = useAuthStore()

const prompt = ref('')
const response = ref('')
const gratitudes = ref([''])
const goals = ref([''])
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

function addGratitude() {
  if (gratitudes.value.length < 5) gratitudes.value.push('')
}
function removeGratitude(index) {
  gratitudes.value.splice(index, 1)
  if (gratitudes.value.length === 0) gratitudes.value.push('')
}

function addGoal() {
  if (goals.value.length < 5) goals.value.push('')
}
function removeGoal(index) {
  goals.value.splice(index, 1)
  if (goals.value.length === 0) goals.value.push('')
}

async function handleSubmit() {
  if (!response.value.trim()) {
    submitError.value = 'Please write a response to the prompt before saving.'
    return
  }
  submitError.value = null
  successMessage.value = null
  submitting.value = true

  try {
    await api.post('/api/entries', {
      prompt: prompt.value,
      response: response.value,
      gratitudes: gratitudes.value.filter(g => g.trim()),
      goals: goals.value.filter(g => g.trim()),
    })
    successMessage.value = '✅ Entry saved!'
    response.value = ''
    gratitudes.value = ['']
    goals.value = ['']
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