<template>
  <div>
    <h1>Spotify Player</h1>
    <button @click="login">Login with Spotify</button>
    <SpotifyPlayer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SpotifyPlayer from '../components/SpotifyPlayer.vue';
import { login } from '../services/spotifyService';

export default defineComponent({
  name: 'HomePage',
  components: { SpotifyPlayer },
  methods: { login },
});
</script>