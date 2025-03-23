<!-- src/components/SideMenu.vue -->
<template>
  <div class="side-menu">
    <h1>Spotify Player</h1>
    <img src="https://developer-assets.spotifycdn.com/images/guidelines/design/icon1.svg" alt="Spotify logo" />
    <nav class="menu">
      <input type="text" placeholder="Rechercher une playlist" />
      <ul>
        <li>
          <button class="button-primary" @click="testBackend">Tester le backend</button>
          <p>{{ message }}</p>
        </li>
        <li>
          <button class="button-primary" @click="loginSpotify" v-if="!accessToken">Connexion Spotify</button>
        </li>
        <li>
          <button class="button-secondary" @click="logoutUser" v-if="accessToken">Déconnexion</button>
        </li>
        <li>
          <button class="button-primary" @click="fetchProfile" v-if="accessToken">Récupérer profil</button>
          <p v-if="profile">Bonjour, {{ profile.display_name }}</p>
        </li>
        <li>
          <RouterLink to="/">Accueil</RouterLink>
        </li>
        <li>
          <RouterLink to="/my-playlists">Mes Playlists</RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchToken, logout, getProfile } from '../services/authService';
import { login } from '../services/spotifyService';

const message = ref('');
const APIURL = import.meta.env.VITE_BASE_URL;

const accessToken = ref<string | null>(null);
const profile = ref<SpotifyProfile | null>(null);
const playlists = ref<SpotifyPlaylist[]>([]);
const selectedPlaylist = ref<SpotifyPlaylist | null>(null);
const tracks = ref<SpotifyPlaylistTrack[]>([]);

const fetchTokenOnMount = async () => {
  try {
    accessToken.value = await fetchToken();
    console.log('Token récupéré:', accessToken.value);
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
  }
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

onMounted(async () => {
  await fetchTokenOnMount();
  // await fetchPlaylists();
});

</script>

<style scoped>
.side-menu {
  background-color: var(--spotify-dark-grey);
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h1 {
  font-size: 1.5rem;
  color: var(--spotify-white);
  margin: 0;
}

img {
  width: 50px;
}

.menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background-color: var(--spotify-light-grey);
  color: var(--spotify-white);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 0.5rem;
}

a {
  color: var(--spotify-white);
  text-decoration: none;
  font-size: 1.1rem;
}

a:hover {
  color: var(--spotify-green);
}
</style>