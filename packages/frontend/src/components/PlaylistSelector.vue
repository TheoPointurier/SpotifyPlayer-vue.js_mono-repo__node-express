<!-- src/components/PlaylistSelector.vue -->
<template>
  <div class="playlist-selector">
    <h2>Mes Playlists</h2>
    <section class="playlists-section">
      <ul class="playlist-list">
        <li v-for="playlist in playlists" :key="playlist.id" class="playlist-item card"
          @click="emitSelectPlaylist(playlist)">
          <img :src="playlist.images?.[1]?.url || 'https://via.placeholder.com/200'" alt="Playlist cover"
            class="playlist-cover" @error="handleImageError" />
          <button class="playlist-button">
            {{ playlist.name }}
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PlaylistSelector',
  props: {
    token: {
      type: String,
      required: true,
    },
    playlists: {
      type: Array as () => SpotifyPlaylist[],
      default: () => [], // Ajouter une valeur par défaut
    },
  },
  setup(props, { emit }) {
    const emitSelectPlaylist = (playlist: SpotifyPlaylist) => {
      emit('select-playlist', playlist);
    };

    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      img.src = 'https://placehold.co/200x200'; // Image de secours
    };

    return {
      emitSelectPlaylist,
      handleImageError,
    };
  },
});
</script>

<style scoped>
.playlist-selector {
  grid-column: 1 / 2;
  max-height: 80vh;
  scrollbar-width: thin;
  /* For Firefox */
  scrollbar-color: var(--spotify-white) transparent;
  /* For Firefox */

  &::-webkit-scrollbar {
    width: 8px;
    /* For WebKit browsers */
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--spotify-white);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  overflow-y: auto;

  &:not(:hover)::-webkit-scrollbar-thumb {
    background-color: transparent;
    /* Hide scrollbar thumb when not hovering */
  }

}

.playlist-list {
  gap: 16px;
}


.playlists-section {
  display: flex;
  flex-direction: column;
}

.playlist-item {
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.playlist-button {
  background: none;
  border: none;
  color: var(--spotify-white);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  width: 100%;
  cursor: pointer;
}

.playlist-cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}
</style>