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

@media screen and (max-width: 768px) {
  .main-layout {
    height: 100dvh;
    width: 100dvw;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 80% 12% 8%;
    overflow: hidden;
  }

  .side-menu {
    grid-row: 3 / 4;
    grid-column: 1 / 2;
    width: 100%;
    height: 100%;
    max-height: 8dvh;
  }

  .main-content {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    width: 100%;
    height: 100%;
    max-height: 80dvh;
    overflow-y: auto;
  }

  .player {
    grid-row: 2 / 3;
    grid-column: 1 / 2;
    width: 100%;
    height: 100%;
    flex-direction: row;
    max-height: 12dvh;
    max-width: 100dvw;
  }
}
</style>