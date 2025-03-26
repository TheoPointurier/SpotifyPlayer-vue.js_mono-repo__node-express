<!-- src/components/PlaylistSelector.vue -->
<template>
  <div class="playlist-selector">
    <h2 class="playlist-selector__title">Mes Playlists</h2>
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
    playlists: {
      type: Array as () => SpotifyPlaylist[],
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const emitSelectPlaylist = (playlist: SpotifyPlaylist) => {
      emit('select-playlist', playlist);
    };

    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      img.src = 'https://placehold.co/200x200';
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
  height: 100%;
  width: 100%;
  grid-column: 1 / 2;
  scrollbar-width: thin;
  scrollbar-color: auto;
  background-color: var(--spotify-dark-grey);
  overflow-y: scroll;
}

.playlist-selector::-webkit-scrollbar {
  width: 8px;
  /* For WebKit browsers */
}

.playlist-selector::-webkit-scrollbar-thumb {
  background-color: var(--spotify-white);
  border-radius: 4px;
}

.playlist-selector::-webkit-scrollbar-track {
  background-color: transparent;
}

.playlist-selector:not(:hover)::-webkit-scrollbar-thumb {
  background-color: transparent;
  /* Hide scrollbar thumb when not hovering */
}

.playlist-selector__title {
  padding: 0.5rem;
  position: sticky;
  top: 0;
  background-color: var(--spotify-dark-grey);
  transition: opacity 0.3s;
  opacity: 1;
}

.playlist-selector:has(:hover) .playlist-selector__title {
  opacity: 0.8;
}


.playlists-section {
  display: flex;
  flex-direction: column;
  padding: 0 0.5rem;
}

.playlist-item {
  padding: 12px;
  /* margin-bottom: 0.5rem; */
  display: flex;
  /* flex-direction: column; */
  align-items: center;
}

.playlist-item:hover {
  cursor: pointer;
}

.playlist-button {
  background: none;
  border: none;
  color: var(--spotify-white);
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  width: 100%;
}

.playlist-cover {
  height: 4.5rem;
  object-fit: cover;
  flex-shrink: 1;
  border-radius: 8px;
  margin-bottom: 8px;
}

@media screen and (max-width: 1105px) {
  .playlist-button {
    font-size: 1vmax;
  }

  .playlist-item {
    justify-content: center;
    width: 20vw;
  }
}

@media screen and (max-width: 768px) {
  .playlist-selector {
    height: 100%;
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    overflow-y: hidden;
    overflow-x: scroll;
  }

  .playlist-selector__title {
    display: none;
  }

  .playlists-section {
    flex-direction: row;
    height: 100%;
    padding: 0;
    margin: 0 0.5rem;
  }

  .playlist-list {
    display: flex;
    flex-direction: row;
    width: auto;
    height: 100%;
    gap: 1rem;
  }

  .playlist-item {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 8rem;
    padding: 0;
  }

  .playlist-button {
    text-align: center;
    font-size: 70%;
    width: 100%;
    padding: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .playlist-cover {
    margin-bottom: 0;
  }
}
</style>