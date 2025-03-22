<!-- src/components/HomePage.vue -->
<template>
  <div class="container">
    <h1>Spotify Player</h1>
    <button class="button-primary" @click="testBackend">Tester le backend</button>
    <p>{{ message }}</p>
    <button class="button-primary" @click="loginSpotify" v-if="!accessToken">Connexion Spotify</button>
    <button class="button-secondary" @click="logoutUser" v-if="accessToken">Déconnexion</button>
    <button class="button-primary" @click="fetchProfile" v-if="accessToken">Récupérer profil</button>
    <p v-if="profile">Bonjour, {{ profile.display_name }}</p>

    <div class="container-player">
      <SpotifyPlayer v-if="accessToken" :token="accessToken" />
      <PlaylistSelector v-if="accessToken" :token="accessToken" />
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import SpotifyPlayer from '../components/SpotifyPlayer.vue';
import PlaylistSelector from '../components/PlaylistSelector.vue';
import { fetchToken, logout, getProfile } from '../services/authService';
import { login } from '../services/spotifyService';

export default defineComponent({
  name: 'HomePage',
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
    };

    onMounted(fetchTokenOnMount);

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
<style scoped>
.container-player {
  display: grid;
  grid-template-columns: 1fr repeat(2, 1fr);
  height: 75vh;
}
</style>