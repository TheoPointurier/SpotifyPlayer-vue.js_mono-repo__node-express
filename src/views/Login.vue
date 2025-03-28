<script setup lang="ts">
import { ref } from 'vue'
import { login } from '../services/spotifyService'

const username = ref('')
const password = ref('')

// const loginFirstSpotify = () => {
//   login();
// }

</script>
<template>
  <div class="login-page">
    <div class="login-page__container">
      <img src="/spotify-logo.png" alt="Spotify logo" class="login-page__img" />
      <h1 class="login-page__title">Connexion à votre compte Spotify</h1>
      <p class="login-page__text">Pour accéder à ce service vous devez disposer d'un compte premium Spotify</p>
      <button @click="login" class="login-page__button">Login</button>
    </div>
  </div>
</template>
<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  height: 100dvh;
}

.login-page__container {
  height: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.login-page__img {
  width: 100px;
  height: 100px;
  margin-bottom: 1.5rem;
}

.login-page__title {
  font-size: 1.5rem;
  color: var(--spotify-white);
  text-align: center;
  margin: 0;
}

.login-page__text {
  font-size: 1rem;
  color: var(--spotify-white);
  text-align: center;
  margin-bottom: 1rem;
}

.login-page__button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: var(--spotify-green);
  color: var(--spotify-white);
  font-size: 1rem;
  cursor: pointer;
}

.login-page__button:hover {
  background-color: var(--spotify-light-green);
  border: 1px solid var(--spotify-green);
  border-radius: 6px;
}
</style>