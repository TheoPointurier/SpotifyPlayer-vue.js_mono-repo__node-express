<script setup lang="ts">
import SpotifyPlayer from '../components/SpotifyPlayer.vue';
import SideMenu from '../components/SideMenu.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="main-layout">
    <SideMenu class="side-menu" />
    <div class="main-content">
      <RouterView />
    </div>
    <SpotifyPlayer />
  </div>
</template>

<style scoped>
.main-layout {
  height: 100%;
  align-content: center;
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 15% 85%;
  grid-template-rows: 85% 15%;
}

.side-menu {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  /* Le SideMenu s'étend sur toute la hauteur */
}

.main-content {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  height: 100%;
  width: 100%;
  align-content: center;
}

@media screen and (max-width: 1775px) {
  .main-layout {
    max-width: 100%;
  }

  .side-menu {
    width: 5vw;
  }

  .main-content,
  .player {
    width: 95vw;
    justify-self: flex-end;
  }
}
</style>