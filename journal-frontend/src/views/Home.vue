<template>
  <div class="page">
    <ThemeSwitcher />
    <h1>📓 Daily Journal</h1>
    <p>Build a journaling habit with daily writing prompts.</p>
    <p>A new prompt every day — just show up and write.</p>

    <RouterLink to="/register">
      <button>Get Started</button>
    </RouterLink>
    <RouterLink to="/login">
      <button class="secondary">Log In</button>
    </RouterLink>
  </div>
</template>

<script setup>
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
</script>