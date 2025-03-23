<!-- src/components/HomePage.vue -->
<template>
  <div class="container">
    <h1>Spotify Player</h1>
    <div class="container-buttons">
      <button class="button-primary" @click="testBackend">Tester le backend</button>
      <p>{{ message }}</p>
      <button class="button-primary" @click="loginSpotify" v-if="!accessToken">Connexion Spotify</button>
      <button class="button-secondary" @click="logoutUser" v-if="accessToken">Déconnexion</button>
      <button class="button-primary" @click="fetchProfile" v-if="accessToken">Récupérer profil</button>
      <p v-if="profile">Bonjour, {{ profile.display_name }}</p>
    </div>

    <div class="container-player">
      <PlaylistSelector v-if="accessToken" :token="accessToken" :playlists="playlists"
        @select-playlist="selectPlaylist" />
      <SpotifyPlayer v-if="accessToken" :token="accessToken" />
      <TrackList v-if="accessToken && selectedPlaylist" :selected-playlist="selectedPlaylist" :tracks="tracks"
        :token="accessToken" :is-player-ready="isPlayerReady" @update-context="updateContext" />
      <div v-else-if="accessToken">
        <p>Sélectionnez une playlist pour accéder aux morceaux</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import SpotifyPlayer from '../components/SpotifyPlayer.vue';
import PlaylistSelector from '../components/PlaylistSelector.vue';
import TrackList from '../components/TrackList.vue';
import { fetchToken, logout, getProfile } from '../services/authService';
import { login } from '../services/spotifyService';
import { getUserPlaylists, getPlaylistTracks } from '../services/spotifyService';
import { isPlayerReady } from '../services/spotifyPlayerSetup';
import { clearQueue, addToQueue } from '../services/playbackState';

// Variables réactives
const message = ref('');
const accessToken = ref<string | null>(null);
const profile = ref<SpotifyProfile | null>(null);
const playlists = ref<SpotifyPlaylist[]>([]);
const selectedPlaylist = ref<SpotifyPlaylist | null>(null);
const tracks = ref<SpotifyPlaylistTrack[]>([]);
const hasInitializedContext = ref<boolean>(false);
const APIURL = import.meta.env.VITE_BASE_URL;

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

const testBackend = async () => {
  const response = await fetch(`${APIURL}/api/test`);
  const data = await response.json();
  message.value = data.message;
};

const loginSpotify = () => {
  login();
};

const logoutUser = async () => {
  await logout();
  accessToken.value = null;
  profile.value = null;
  playlists.value = [];
  selectedPlaylist.value = null;
  tracks.value = [];
};

const fetchProfile = async () => {
  if (!accessToken.value) return;
  profile.value = await getProfile(accessToken.value);
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
  grid-template-columns: 20% 50% 30%;
  height: 75vh;
  width: 90%;
  margin: 0 auto;
}

.container-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
  align-items: center;
}
</style>