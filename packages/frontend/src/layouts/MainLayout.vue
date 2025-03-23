<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <SideMenu class="side-menu" />
    <div class="main-content">
      <RouterView />
    </div>
    <SpotifyPlayer v-if="accessToken" :token="accessToken" />
  </div>
</template>

<script setup lang="ts">
import SpotifyPlayer from '../components/SpotifyPlayer.vue';
import SideMenu from '../components/SideMenu.vue';
import { RouterView } from 'vue-router';

import { ref, onMounted } from 'vue';
import { fetchToken } from '../services/authService';

// Récupérer le token pour le lecteur
const accessToken = ref<string | null>(null);

onMounted(async () => {
  accessToken.value = await fetchToken();
});
</script>

<style scoped>
.main-layout {
  height: 100vh;
  height: 100dvh;
  display: grid;
  grid-template-columns: 15% 85%;
}

.side-menu {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  /* Le SideMenu s'étend sur toute la hauteur */
}

.main-content {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  padding: 1rem;
  max-height: 80vh;
  max-height: 80dvh;
}
</style>