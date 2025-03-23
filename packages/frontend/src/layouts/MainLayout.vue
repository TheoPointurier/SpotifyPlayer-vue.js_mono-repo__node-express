<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <SideMenu class="side-menu" />
    <div class="main-content">
      <RouterView />
    </div>
    <div class="player-placeholder">
      <!-- Emplacement pour le lecteur (à ajouter plus tard) -->
      <p>Lecteur Spotify (à venir)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideMenu from '../components/SideMenu.vue';
import { RouterView } from 'vue-router';
</script>

<style scoped>
.main-layout {
  display: grid;
  grid-template-columns: 10% 90%;
  /* SideMenu à gauche, contenu principal à droite */
  grid-template-rows: auto 100px;
  /* Contenu principal en haut, lecteur en bas */
  min-height: 100vh;
}

.side-menu {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
  /* Le SideMenu s'étend sur toute la hauteur */
}

.main-content {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  padding: 1rem;
}

.player-placeholder {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  background-color: var(--spotify-dark-grey);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
</style>