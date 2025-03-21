<!-- src/App.vue -->
<template>
  <div>
    <h1>Lecteur Spotify</h1>
    <button @click="testBackend">Tester le backend</button>
    <p>{{ message }}</p>
    <button @click="loginSpotify" v-if="!accessToken">Connexion Spotify</button>
    <button @click="logoutUser" v-if="accessToken">Déconnexion</button>
    <button @click="fetchProfile" v-if="accessToken">Récupérer profil</button>
    <p v-if="profile">Bonjour, {{ profile.display_name }}</p>

    <SpotifyPlayer v-if="accessToken" :token="accessToken" />
    <PlaylistSelector v-if="accessToken" :token="accessToken" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import SpotifyPlayer from './components/SpotifyPlayer.vue';
import PlaylistSelector from './components/PlaylistSelector.vue';
import { fetchToken, logout, getProfile } from './services/authService';
import { login } from './services/spotifyService';
import { initializeSpotifyPlayer, cleanupSpotifyPlayer } from './services/spotifyPlayerSetup';

export default defineComponent({
  name: 'App',
  components: {
    SpotifyPlayer,
    PlaylistSelector,
  },
  setup() {
    const message = ref('');
    const accessToken = ref<string | null>(null);
    const profile = ref<SpotifyProfile | null>(null);
    const APIURL = import.meta.env.VITE_BASE_URL;

    const fetchTokenOnMount = async () => {
      accessToken.value = await fetchToken();
      if (accessToken.value) {
        // Initialiser le SDK une fois que le token est disponible
        initializeSpotifyPlayer(accessToken.value);
      }
    };

    onMounted(fetchTokenOnMount);

    onUnmounted(() => {
      // Nettoyer le lecteur lors de la destruction de l’app
      cleanupSpotifyPlayer();
    });

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
      cleanupSpotifyPlayer(); // Nettoyer le lecteur lors de la déconnexion
    };

    const fetchProfile = async () => {
      if (!accessToken.value) return;
      profile.value = await getProfile(accessToken.value);
    };

    return {
      message,
      accessToken,
      profile,
      testBackend,
      loginSpotify,
      logoutUser,
      fetchProfile,
    };
  },
});
</script>