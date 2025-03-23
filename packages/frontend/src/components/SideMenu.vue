<!-- src/components/SideMenu.vue -->
<template>
  <div class="side-menu">
    <h1>Spotify Player</h1>
    <img src="https://developer-assets.spotifycdn.com/images/guidelines/design/icon1.svg" alt="Spotify logo" />
    <nav class="menu">
      <input type="text" placeholder="Rechercher une playlist" />
      <ul>
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
import { RouterLink } from 'vue-router';
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