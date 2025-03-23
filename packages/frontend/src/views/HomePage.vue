<!-- src/components/HomePage.vue -->
<template>

  <div class="container-player">
    <PlaylistSelector v-if="accessToken" :token="accessToken" :playlists="playlists"
      @select-playlist="selectPlaylist" />
    <TrackList v-if="accessToken && selectedPlaylist" :selected-playlist="selectedPlaylist" :tracks="tracks"
      :token="accessToken" :is-player-ready="isPlayerReady" @update-context="updateContext" />
    <div v-else-if="accessToken" class="tracks-section">
      <p>Sélectionnez une playlist pour accéder aux morceaux</p>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import PlaylistSelector from '../components/PlaylistSelector.vue';
import TrackList from '../components/TrackList.vue';
import { fetchToken } from '../services/authService';
import { getUserPlaylists, getPlaylistTracks } from '../services/spotifyService';
import { isPlayerReady } from '../services/spotifyPlayerSetup';
import { clearQueue, addToQueue } from '../services/playbackState';

// Variables réactives

const accessToken = ref<string | null>(null);
const playlists = ref<SpotifyPlaylist[]>([]);
const selectedPlaylist = ref<SpotifyPlaylist | null>(null);
const tracks = ref<SpotifyPlaylistTrack[]>([]);
const hasInitializedContext = ref<boolean>(false);


// Fonctions
const fetchTokenOnMount = async () => {
  try {
    accessToken.value = await fetchToken();
    console.log('Token récupéré:', accessToken.value);
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
  }
};

const fetchPlaylists = async () => {
  if (!accessToken.value) {
    console.log('Pas de token, impossible de charger les playlists');
    return;
  }
  try {
    console.log('Chargement des playlists...');
    playlists.value = await getUserPlaylists(accessToken.value);
    console.log('Playlists chargées:', playlists.value);
  } catch (error) {
    console.error('Erreur lors du chargement des playlists:', error);
  }
};

const selectPlaylist = async (playlist: SpotifyPlaylist) => {
  selectedPlaylist.value = playlist;
  try {
    console.log('Récupération des pistes pour la playlist:', playlist.name);
    if (accessToken.value) {
      tracks.value = await getPlaylistTracks(accessToken.value, playlist.id);
    } else {
      console.error('Access token is null, cannot fetch playlist tracks.');
    }
    console.log('Pistes récupérées:', tracks.value);
    // Vider la file d'attente actuelle
    clearQueue();
    // Ajouter les pistes de la playlist à la file d'attente
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
  await fetchTokenOnMount();
  await fetchPlaylists();
});

// Watchers
watch(accessToken, async (newToken) => {
  if (newToken) {
    console.log('Token mis à jour, rechargement des playlists...');
    await fetchPlaylists();
  }
});
</script>

<style scoped>
.container-player {
  display: grid;
  align-items: center;
  gap: 1rem;
  grid-template-columns: 20% 80%;
  margin: 0 auto;
  max-height: 80vh;
  width: 100%;
}

.container-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
  align-items: center;
}
</style>