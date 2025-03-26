<template>
  <div class="service-unavailable">
    <h1>Service Indisponible</h1>
    <p>Le serveur est temporairement hors ligne. Veuillez réessayer plus tard.</p>
    <p v-if="message" class="temp-message">{{ message }}</p>
    <button @click="navigateToHome">Retour à l’accueil</button>
  </div>
</template>
<script lang="ts" setup>

import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const message = ref<string | null>(null);

async function navigateToHome() {
  try {

    await router.push('/');

  } catch (error) {
    message.value = 'Pas encore :(';
    console.error('Erreur lors de la navigation vers la page d’accueil:', error);

    setTimeout(() => {
      message.value = null;
    }, 2000);
  }

}


</script>

<style scoped>
.service-unavailable {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  color: var(--spotify-white);
  background-color: var(--spotify-dark-grey);
  justify-content: center;
  height: 100vh;
}

button {
  margin-top: 1rem;
}

.temp-message {
  color: var(--spotify-green);
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>