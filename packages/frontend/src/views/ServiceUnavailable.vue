<template>
  <div class="service-unavailable">
    <h1>Service Indisponible</h1>
    <p>Le serveur est temporairement hors ligne. Veuillez réessayer plus tard.</p>
    <button @click="$router.push('/')">Retour à l’accueil</button>
  </div>
</template>

<style scoped>
.service-unavailable {
  text-align: center;
  padding: 2rem;
  color: var(--spotify-white);
  background-color: var(--spotify-dark-grey);
}
</style>