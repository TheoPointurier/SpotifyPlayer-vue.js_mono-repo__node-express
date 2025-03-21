<template>
  <div>
    <h1>Lecteur Spotify</h1>
    <button @click="testBackend">Tester le backend</button>
    <p>{{ message }}</p>
    <button @click="loginSpotify" v-if="!accessToken">Connexion Spotify</button>
    <button @click="getProfile" v-if="accessToken">Récupérer profil</button>
    <p v-if="profile">Bonjour, {{ profile.display_name }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'App',
  setup() {
    const message = ref('');
    const accessToken = ref<string | null>(null);
    const profile = ref<any>(null);

    // Vérifie si un code est présent dans l'URL après redirection
    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        fetchToken(code);
        window.history.replaceState({}, document.title, '/'); // Nettoie l'URL
      }
    });

    const testBackend = async () => {
      const response = await fetch('http://localhost:5000/api/test');
      const data = await response.json();
      message.value = data.message;
    };

    const loginSpotify = () => {
      window.location.href = 'http://localhost:5000/auth/login';
    };

    const fetchToken = async (code: string) => {
      try {
        const response = await fetch(`http://localhost:5000/auth/callback?code=${code}`);
        const data = await response.json();
        accessToken.value = data.access_token;
      } catch (error) {
        console.error('Erreur lors de la récupération du token', error);
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

    return { message, accessToken, profile, testBackend, loginSpotify, getProfile };
  },
});
</script>