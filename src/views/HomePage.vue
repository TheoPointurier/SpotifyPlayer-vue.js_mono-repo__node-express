<!-- src/components/HomePage.vue -->
<template>
  <div class="home-page">
    <h1>Bienvenue sur Spotify Player</h1>
    <p>Ceci est une page d'accueil temporaire. Ajoutez votre contenu ici.</p>
    <button @click="logPlaylist">Afficher la playlist</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const message = ref("");



</script>
<script lang="ts">
import { getTheOnePlaylist } from '../services/spotifyService.ts';
async function logPlaylist() {
  const playlist = await getTheOnePlaylist();
  console.log(playlist);
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--spotify-white);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  color: var(--spotify-light-grey);
}
</style>