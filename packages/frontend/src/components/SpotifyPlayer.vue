<template>
  <div>
    <h2>Now Playing</h2>
    <p>{{ track?.item?.name || 'No track playing' }}</p>
    <button @click="fetchTrack">Refresh</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getCurrentTrack } from '../services/spotifyService';

export default defineComponent({
  name: 'SpotifyPlayer',
  data() {
    return {
      track: null as any,
      token: '' as string,
    };
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.token = urlParams.get('access_token') || '';
    if (this.token) this.fetchTrack();
  },
  methods: {
    async fetchTrack() {
      try {
        this.track = await getCurrentTrack(this.token);
      } catch (error) {
        console.error('Error fetching track:', error);
      }
    },
  },
});
</script>