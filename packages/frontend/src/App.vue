<template>
  <div>
    <h1>Lecteur Spotify</h1>
    <button @click="testBackend">Tester le backend</button>
    <p>{{ message }}</p>
    <button @click="loginSpotify" v-if="!accessToken">Connexion Spotify</button>
    <button @click="logout" v-if="accessToken">Déconnexion</button>
    <button @click="getProfile" v-if="accessToken">Récupérer profil</button>
    <p v-if="profile">Bonjour, {{ profile.display_name }}</p>

    <SpotifyPlayer v-if="accessToken" :token="accessToken" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import SpotifyPlayer from './components/SpotifyPlayer.vue';
import { getCurrentTrack } from './services/spotifyService';
import type { SpotifyTrack, SpotifyProfile } from '../types/spotify.ts';

export default defineComponent({
  name: 'App',
  components: {
    SpotifyPlayer,
  },
  setup() {
    const message = ref('');
    const accessToken = ref<string | null>(null);
    const profile = ref<SpotifyProfile | null>(null);
    const track = ref<SpotifyTrack | null>(null);
    const APIURL = import.meta.env.VITE_BASE_URL;

    const fetchToken = async () => {
      try {
        const response = await fetch(`${APIURL}/auth/get-token`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          accessToken.value = data.access_token;
        } else {
          accessToken.value = null;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token', error);
        accessToken.value = null;
      }
    };

    onMounted(fetchToken);

    const testBackend = async () => {
      const response = await fetch(`${APIURL}/api/test`);
      const data = await response.json();
      message.value = data.message;
    };

    const loginSpotify = () => {
      window.location.href = `${APIURL}/auth/login`;
    };

    const logout = async () => {
      try {
        const response = await fetch(`${APIURL}/auth/logout`, {
          credentials: 'include',
        });
        if (response.ok) {
          accessToken.value = null;
          profile.value = null;
          track.value = null;
        }
      } catch (error) {
        console.error('Erreur lors de la déconnexion', error);
      }
    };

    const getProfile = async () => {
      if (!accessToken.value) return;
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
          },
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du profil');
        }
        const data = await response.json();
        profile.value = data;
      } catch (error) {
        console.error(error);
      }
    };

    const fetchTrack = async () => {
      if (!accessToken.value) return;
      try {
        const data = await getCurrentTrack(accessToken.value);
        track.value = data;
      } catch (error) {
        console.error('Error fetching track:', error);
      }
    };

    return {
      message,
      accessToken,
      profile,
      track,
      testBackend,
      loginSpotify,
      logout,
      getProfile,
      fetchTrack,
    };
  },
});
</script>