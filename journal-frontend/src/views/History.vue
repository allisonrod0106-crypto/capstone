<template>
  <div class="page">
    <div class="nav">
      <h1>📓 History</h1>
      <RouterLink to="/journal">
        <button class="secondary">Back</button>
      </RouterLink>
    </div>

    <div class="search-bar">
      <input v-model="search" @input="handleSearch" placeholder="🔍 Search entries..." />
    </div>

    <div v-if="loading">Loading entries...</div>

    <div v-else-if="error" class="error-msg">{{ error }}</div>

    <div v-else-if="entries.length === 0">
      <p>No entries yet. <RouterLink to="/journal">Write your first one!</RouterLink></p>
    </div>

    <div v-else>
      <div v-for="entry in entries" :key="entry._id" class="card">
        <p class="entry-date">{{ formatDate(entry.createdAt) }}</p>
        <p><strong>Prompt:</strong> {{ entry.prompt }}</p>
        <p><strong>Response:</strong> {{ entry.response }}</p>

          <div v-if="entry.gratitudes && entry.gratitudes.length">
    <p><strong>🙏 Gratitudes:</strong></p>
    <ul>
      <li v-for="(g, i) in entry.gratitudes" :key="i">{{ g }}</li>
    </ul>
  </div>

  <div v-if="entry.goals && entry.goals.length" style="margin-top: 8px;">
    <p><strong>🎯 Goals:</strong></p>
    <ul>
      <li v-for="(g, i) in entry.goals" :key="i">{{ g }}</li>
    </ul>
  </div>
  
      </div>
      <p style="color: #aaa; font-size: 0.85rem;">Showing {{ entries.length }} of {{ pagination.total }} entries</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/axios'

const entries = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const pagination = ref({ total: 0 })
let searchTimeout = null

onMounted(async () => {
  await fetchEntries()
})

async function fetchEntries(searchTerm = '') {
  loading.value = true
  error.value = null
  try {
    const params = searchTerm ? { search: searchTerm } : {}
    const res = await api.get('/api/entries', { params })
    entries.value = res.data.entries
    pagination.value = res.data.pagination
  } catch (err) {
    error.value = 'Failed to load entries.'
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchEntries(search.value), 400)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}
</script>