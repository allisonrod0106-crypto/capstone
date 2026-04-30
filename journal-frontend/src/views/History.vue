<template>
  <div>
    <h1>Journal History</h1>

    <input
      v-model="search"
      @input="handleSearch"
      placeholder="Search entries..."
    />

    <div v-if="loading">Loading entries...</div>

    <div v-else-if="error" style="color: red;">{{ error }}</div>

    <div v-else-if="entries.length === 0">
      <p>No entries yet. <RouterLink to="/journal">Write your first one!</RouterLink></p>
    </div>

    <div v-else>
      <div v-for="entry in entries" :key="entry._id" style="border: 1px solid #ccc; margin: 10px 0; padding: 10px;">
        <p style="color: gray; font-size: 0.85em;">{{ formatDate(entry.createdAt) }}</p>
        <p><strong>Prompt:</strong> {{ entry.prompt }}</p>
        <p><strong>Response:</strong> {{ entry.response }}</p>
      </div>

      <p>Showing {{ entries.length }} of {{ pagination.total }} entries</p>
    </div>

    <br />
    <RouterLink to="/journal">Back to journal</RouterLink>
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
    error.value = 'Failed to load entries. Make sure the backend is running.'
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  // Wait for the user to stop typing before searching
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchEntries(search.value)
  }, 400)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>