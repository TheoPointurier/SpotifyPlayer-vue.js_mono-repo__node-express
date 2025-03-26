<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PlaylistSelector from '../components/PlaylistSelector.vue';
import TrackList from '../components/TrackList.vue';
import { getUserPlaylists, getPlaylistTracks } from '../services/spotifyService';
import { isPlayerReady } from '../services/spotifyPlayerSetup';
import { clearQueue, addToQueue } from '../services/playbackState';

// Variables réactives
const playlists = ref<SpotifyPlaylist[]>([]);
const selectedPlaylist = ref<SpotifyPlaylist | null>(null);
const tracks = ref<SpotifyPlaylistTrack[]>([]);
const hasInitializedContext = ref<boolean>(false);
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);

// Fonctions
const fetchPlaylists = async () => {
  try {
    isLoading.value = true;
    playlists.value = await getUserPlaylists();
    // console.log('Playlists chargées:', playlists.value);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (err: any) {
    console.error('Erreur lors du chargement des playlists:', err);
    if (err.message.includes('Non authentifié')) {
      error.value = 'Veuillez vous connecter pour voir vos playlists.';
      window.location.href = '/login';
    } else {
      error.value = 'Erreur lors du chargement des playlists.';
    }
  } finally {
    isLoading.value = false;
  }
};

const selectPlaylist = async (playlist: SpotifyPlaylist) => {
  selectedPlaylist.value = playlist;
  try {
    // console.log('Récupération des pistes pour la playlist:', playlist.name);
    tracks.value = await getPlaylistTracks(playlist.id);
    // console.log('Pistes récupérées:', tracks.value);
    clearQueue();
    for (const track of tracks.value) {
      addToQueue(track.track.uri);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des pistes:', error);
  }
};

const updateContext = (value: boolean) => {
  hasInitializedContext.value = value;
};

// Lifecycle hooks
onMounted(async () => {
  await fetchPlaylists();
});
</script>

<template>
  <div class="my-playlists">
    <div class="content">
      <h1>Mes playlists</h1>
      <div v-if="isLoading">Chargement des playlists...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else class="container-player">
        <PlaylistSelector :playlists="playlists" @select-playlist="selectPlaylist" />
        <TrackList v-if="selectedPlaylist" :selected-playlist="selectedPlaylist" :tracks="tracks"
          :is-player-ready="isPlayerReady" @update-context="updateContext" />
        <div v-else class="tracks-section">
          <p>Sélectionnez une playlist pour accéder aux morceaux</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-playlists {
  height: 100%;
  width: 100%;
}

.content {
  height: 100%;
}

h1 {
  font-size: 2rem;
  color: var(--spotify-white);
  height: 10%;
  margin: 0;
  align-content: center;
}

.container-player {
  display: grid;
  align-items: center;
  grid-template-columns: 20% 80%;
  margin: 0 auto;
  width: 100%;
  height: 90%;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 1rem;
}

@media screen and (max-width: 768px) {

  .container-player {
    grid-template-columns: 1fr;
    grid-template-rows: 20% 80%;
  }
}
</style>