<!-- src/App.vue -->
<template>
  <div class="app">
    <HomePage />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HomePage from './views/HomePage.vue';

export default defineComponent({
  name: 'App',
  components: {
    HomePage,
  },
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--spotify-black);
}
</style>