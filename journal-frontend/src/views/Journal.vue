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

      <div class="card">
        <h2>📝 Response</h2>
        <div class="form-group">
          <textarea v-model="response" placeholder="Start writing..."></textarea>
        </div>
        <p v-if="responseError" class="error-msg">{{ responseError }}</p>
        <p v-if="responseSuccess" class="success-msg">{{ responseSuccess }}</p>
        <button @click="saveResponse" :disabled="savingResponse">
          {{ savingResponse ? 'Saving...' : 'Save Response' }}
        </button>
      </div>

      <!-- ── Gratitudes ──────────────────────────── -->
      <div class="card">
        <h2>🙏 Gratitudes</h2>
        <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 12px;">
          What are you grateful for today?
        </p>

        <div v-for="(item, index) in gratitudes" :key="index" class="list-row">
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

        <br />
        <p v-if="gratitudesError" class="error-msg">{{ gratitudesError }}</p>
        <p v-if="gratitudesSuccess" class="success-msg">{{ gratitudesSuccess }}</p>
        <button @click="saveGratitudes" :disabled="savingGratitudes">
          {{ savingGratitudes ? 'Saving...' : 'Save Gratitudes' }}
        </button>
      </div>

      <!-- ── Goals ──────────────────────────────── -->
      <div class="card">
        <h2>🎯 Goals</h2>
        <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 12px;">
          What do you want to accomplish today?
        </p>

        <div v-for="(item, index) in goals" :key="index" class="list-row">
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

        <br />
        <p v-if="goalsError" class="error-msg">{{ goalsError }}</p>
        <p v-if="goalsSuccess" class="success-msg">{{ goalsSuccess }}</p>
        <button @click="saveGoals" :disabled="savingGoals">
          {{ savingGoals ? 'Saving...' : 'Save Goals' }}
        </button>
      </div>

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

// Prompt
const prompt = ref('')
const loading = ref(true)
const error = ref(null)

// Today's entry id — shared across all three sections
const entryId = ref(null)

// Response section
const response = ref('')
const savingResponse = ref(false)
const responseError = ref(null)
const responseSuccess = ref(null)

// Gratitudes section
const gratitudes = ref([''])
const savingGratitudes = ref(false)
const gratitudesError = ref(null)
const gratitudesSuccess = ref(null)

// Goals section
const goals = ref([''])
const savingGoals = ref(false)
const goalsError = ref(null)
const goalsSuccess = ref(null)

onMounted(async () => {
  try {
    // Load today's prompt
    const promptRes = await api.get('/api/prompts/daily')
    prompt.value = promptRes.data.prompt.text

    // Check if an entry already exists for today
    const todayRes = await api.get('/api/entries/today')
    if (todayRes.data.entry) {
      const entry = todayRes.data.entry
      entryId.value = entry._id
      response.value = entry.response || ''
      gratitudes.value = entry.gratitudes?.length ? entry.gratitudes : ['']
      goals.value = entry.goals?.length ? entry.goals : ['']
    }
  } catch (err) {
    error.value = 'Failed to load. Make sure the backend is running.'
  } finally {
    loading.value = false
  }
})

// ── Shared helper ─────────────────────────────────────────────────────────────
// Creates entry on first save, updates it on subsequent saves
async function saveField(field, value) {
  if (entryId.value) {
    const res = await api.patch(`/api/entries/${entryId.value}`, { [field]: value })
    return res.data.entry
  } else {
    const payload = {
      prompt: prompt.value,
      response: field === 'response' ? value : '',
      goals: field === 'goals' ? value : [],
      gratitudes: field === 'gratitudes' ? value : [],
    }
    const res = await api.post('/api/entries', payload)
    entryId.value = res.data.entry._id
    return res.data.entry
  }
}

// ── Response ──────────────────────────────────────────────────────────────────
async function saveResponse() {
  if (!response.value.trim()) {
    responseError.value = 'Please write something before saving.'
    return
  }
  responseError.value = null
  responseSuccess.value = null
  savingResponse.value = true
  try {
    await saveField('response', response.value.trim())
    responseSuccess.value = '✅ Response saved!'
  } catch (err) {
    responseError.value = err.response?.data?.error || 'Failed to save.'
  } finally {
    savingResponse.value = false
  }
}

// ── Gratitudes ────────────────────────────────────────────────────────────────
function addGratitude() {
  if (gratitudes.value.length < 5) gratitudes.value.push('')
}
function removeGratitude(index) {
  gratitudes.value.splice(index, 1)
  if (gratitudes.value.length === 0) gratitudes.value.push('')
}

async function saveGratitudes() {
  const filtered = gratitudes.value.filter(g => g.trim())
  if (!filtered.length) {
    gratitudesError.value = 'Please add at least one gratitude before saving.'
    return
  }
  gratitudesError.value = null
  gratitudesSuccess.value = null
  savingGratitudes.value = true
  try {
    await saveField('gratitudes', filtered)
    gratitudesSuccess.value = '✅ Gratitudes saved!'
  } catch (err) {
    gratitudesError.value = err.response?.data?.error || 'Failed to save.'
  } finally {
    savingGratitudes.value = false
  }
}

// ── Goals ─────────────────────────────────────────────────────────────────────
function addGoal() {
  if (goals.value.length < 5) goals.value.push('')
}
function removeGoal(index) {
  goals.value.splice(index, 1)
  if (goals.value.length === 0) goals.value.push('')
}

async function saveGoals() {
  const filtered = goals.value.filter(g => g.trim())
  if (!filtered.length) {
    goalsError.value = 'Please add at least one goal before saving.'
    return
  }
  goalsError.value = null
  goalsSuccess.value = null
  savingGoals.value = true
  try {
    await saveField('goals', filtered)
    goalsSuccess.value = '✅ Goals saved!'
  } catch (err) {
    goalsError.value = err.response?.data?.error || 'Failed to save.'
  } finally {
    savingGoals.value = false
  }
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>