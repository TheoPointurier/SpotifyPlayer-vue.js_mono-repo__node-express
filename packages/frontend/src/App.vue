<!-- src/App.vue -->
<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--spotify-black);
}
</style>