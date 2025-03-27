<!-- src/components/SideMenu.vue -->
<template>
  <div class="side-menu">
    <RouterLink to="/">
      <img src="../assets/spotify-logo.png" alt="Spotify logo" class="logo" />
    </RouterLink>
    <h1 class="menu-title">Spotify Player</h1>
    <!-- Bouton burger visible uniquement en mobile -->
    <button class="burger-button" @click="toggleMenu" v-if="isMobile">
      <i :class="isMenuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
    </button>
    <div class="overlay" v-if="isMenuOpen && isMobile" @click="toggleMenu"></div>
    <!-- Menu principal -->
    <nav class="menu" :class="{ 'menu-open': isMenuOpen && isMobile }">
      <ul class="menu-list">
        <li v-if="isAuthenticated" class="profile-text">
          <i class="fas fa-user"></i>
          <p v-if="profile" class="menu-text">Bonjour, {{ profile.display_name }}</p>
        </li>
        <li>
          <RouterLink to="/" @click="toggleMenu">
            <i class="fas fa-home"></i>
            <p class="menu-text">Accueil</p>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/my-playlists" @click="toggleMenu">
            <i class="fas fa-list"></i>
            <p class="menu-text">Mes Playlists</p>
          </RouterLink>
        </li>
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
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchToken, logout, getProfile } from '../services/authService';
import { login } from '../services/spotifyService';

const message = ref('');
const APIURL = import.meta.env.VITE_BASE_URL;
const isAuthenticated = ref<boolean>(false);
const profile = ref<SpotifyProfile | null>(null);
const isMenuOpen = ref(false);

// Detect if the user is on mobile
const isMobile = computed(() => window.innerWidth <= 768);

const fetchTokenOnMount = async () => {
  try {
    await fetchToken();
    isAuthenticated.value = true;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    isAuthenticated.value = false;
  }
};

const loginSpotify = () => {
  login();
  isMenuOpen.value = false; // Close the menu after login
};

const logoutUser = async () => {
  try {
    await logout();
    isAuthenticated.value = false;
    profile.value = null;
    isMenuOpen.value = false; // Close the menu after logout
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
      // window.location.href = '/login';
    }
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Fetch the token and profile on mount / Add event listener for window resize
onMounted(async () => {
  await fetchTokenOnMount();
  if (isAuthenticated.value) {
    await fetchProfile();
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) isMenuOpen.value = false;
  });
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
  transition: opacity 0.2s ease;
}

.side-menu:hover .menu-title {
  opacity: 1;
}

.logo {
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
}

.menu-list-bottom {
  justify-self: end;
}

.menu-text {
  color: var(--spotify-white);
  text-decoration: none;
  font-size: 1.1rem;
  opacity: 0;
  display: none;
  transition: opacity 0.5s ease;
}

.side-menu:hover .menu-text {
  opacity: 1;
  display: block;
}

.menu-text:hover {
  color: var(--spotify-green);
}

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

.burger-button {
  background: none;
  border: none;
  color: var(--spotify-white);
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  z-index: 10000;
}

.burger-button:hover {
  color: var(--spotify-green);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
  transition: opacity 0.3s ease;
}

@media screen and (max-width: 768px) {
  .side-menu {
    position: initial;
    flex-direction: row;
    width: 100%;
    height: 100%;
    max-height: 8dvh;
    /* Correspond à MainLayout */
    gap: 0;
    padding: 0.5rem;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
  }

  .side-menu:hover {
    width: 100%;
  }

  .logo {
    width: 1.5rem;
    height: 1.5rem;
    margin: 0;
    margin-left: 1rem;
  }

  .menu-title {
    display: none;
  }

  .menu {
    position: fixed;
    top: 0;
    right: -100%;
    width: 70%;
    height: 100dvh;
    background-color: var(--spotify-dark-grey);
    flex-direction: column;
    padding: 2rem 1rem;
    transition: right 0.3s ease;
    z-index: 2;
  }

  .menu.menu-open {
    right: 0;
  }

  .menu-list {
    flex-direction: column;
    gap: 1.5rem;
    justify-content: flex-start;
    align-items: center;
  }

  .profile-text {
    margin-bottom: 2rem;
  }

  .menu-list-bottom {
    padding-right: 0;
    margin-top: auto;
    margin-bottom: 4rem;
  }

  .menu-text {
    display: block;
    opacity: 1;
  }

  .burger-button:hover {
    color: var(--spotify-green);
  }
}
</style>