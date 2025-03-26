<!-- src/components/SideMenu.vue -->
<template>
  <div class="side-menu">
    <img src="../assets/spotify-logo.png" alt="Spotify logo" />
    <h1 class="menu-title">Spotify Player</h1>
    <nav class="menu">
      <!-- <input type="text" placeholder="Rechercher une playlist" class="search-input" /> -->
      <ul class="menu-list">
        <li v-if="isAuthenticated" class="profile-text">
          <i class="fas fa-user"></i>
          <p v-if="profile" class="menu-text">Bonjour, {{ profile.display_name }}</p>
        </li>
        <li>
          <RouterLink to="/">
            <i class="fas fa-home"></i>
            <p class="menu-text">Accueil</p>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/my-playlists">
            <i class="fas fa-list"></i>
            <p class="menu-text">Mes Playlists</p>
          </RouterLink>
        </li>
        <!-- <li @click="testBackend" v-if="isAuthenticated">
          <i class="fas fa-server"></i>
          <button class="button-primary menu-text">Tester le backend</button>
          <p class="menu-text">{{ message }}</p>
        </li> -->
      </ul>
      <ul class="menu-list menu-list-bottom">
        <li @click="loginSpotify" v-if="!isAuthenticated">
          <i class="fas fa-sign-in-alt"></i>
          <button class="button-primary menu-text">Connexion Spotify</button>
        </li>
        <li @click="logoutUser" v-if="isAuthenticated">
          <i class="fas fa-sign-out-alt"></i>
          <button class="button-secondary menu-text">Déconnexion</button>
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
const isAuthenticated = ref<boolean>(false);
const profile = ref<SpotifyProfile | null>(null);

const fetchTokenOnMount = async () => {
  try {
    await fetchToken();
    isAuthenticated.value = true;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    isAuthenticated.value = false;
  }
};

const testBackend = async () => {
  try {
    const response = await fetch(`${APIURL}/api/test`);
    const data = await response.json();
    message.value = data.message;
  } catch (error) {
    console.error('Erreur lors du test du backend:', error);
    message.value = 'Erreur lors du test du backend';
  }
};

const loginSpotify = () => {
  login();
};

const logoutUser = async () => {
  try {
    await logout();
    isAuthenticated.value = false;
    profile.value = null;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};

const fetchProfile = async () => {
  try {
    profile.value = await getProfile();
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    if ((error as Error).message.includes('Non authentifié')) {
      window.location.href = '/login';
    }
  }
};

onMounted(async () => {
  await fetchTokenOnMount();
  if (isAuthenticated.value) {
    await fetchProfile();
  }
});
</script>

<style scoped>
.side-menu {
  position: absolute;
  left: 0;
  background-color: var(--spotify-dark-grey);
  height: 100%;
  width: 5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: width 0.3s ease;
  z-index: 1;
}

.side-menu:hover {
  width: 10%;
}

.menu-title {
  padding: 0.5rem 2px;
  font-size: 1.2rem;
  color: var(--spotify-white);
  margin: 0;
  margin-bottom: 2rem;
  opacity: 0;
  /* Caché par défaut */
  transition: opacity 0.2s ease;
}

.side-menu:hover .menu-title {
  opacity: 1;
  /* Visible au survol */
}

img {
  width: 2rem;
  margin: 1rem auto 0 auto;
}

.menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1rem;
}

.menu-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 2rem;
  word-break: break-all;
  transition: word-break 0.3s ease;
}

.menu-list-bottom {
  justify-self: end;
}

.search-input {
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 4px;
  background-color: var(--spotify-light-grey);
  color: var(--spotify-white);
  opacity: 0;
  /* Caché par défaut */
  transition: opacity 0.2s ease;
}

.side-menu:hover .search-input {
  display: block;
  opacity: 1;
}

li {
  margin-bottom: 1rem;
}

.menu-text {
  color: var(--spotify-white);
  text-decoration: none;
  font-size: 1.1rem;
  opacity: 0;
  display: none;
  /* Caché par défaut */
  transition: opacity 0.5s ease;
}

.side-menu:hover .menu-text {
  opacity: 1;
  display: block;
}

.menu-text:hover {
  color: var(--spotify-green);
}

/* Boutons */
.button-primary,
.button-secondary {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

a {
  color: var(--spotify-white);
  text-decoration: none;
  font-size: 1.1rem;
}

a:hover {
  color: var(--spotify-green);
}

@media screen and (max-width: 768px) {
  .side-menu {
    position: initial;
    flex-direction: row;
    gap: 0;
  }

  .side-menu:hover {
    width: 100%;
  }

  img {
    width: 2rem;
    height: 2rem;
    align-self: center;
    margin: 0 0 0 0.5rem;
  }

  .menu-title {
    display: none;
  }

  .menu {
    flex-direction: row;
    gap: 0;
    padding: 0;
    align-items: center;
  }

  .menu-list {
    flex-direction: row;
    gap: 0;
    width: 100%;
    align-items: center;
    justify-content: space-evenly;
  }

  .menu-list-bottom {
    justify-content: flex-end;
    padding-right: 1rem;
  }

  li {
    align-items: center;
    margin: 0;
  }

  .profile-text {
    display: none;
  }

  .side-menu:hover .menu-text {
    display: none;
  }
}
</style>