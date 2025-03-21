<template>
  <div>
    <h2>Now Playing</h2>
    <p>{{ track?.item?.name || 'No track playing' }}</p>
    <button @click="fetchTrack">Refresh</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { getCurrentTrack } from '../services/spotifyService';
import type { SpotifyTrack } from '../../types/spotify';

export default defineComponent({
  name: 'SpotifyPlayer',
  props: {
    token: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const track = ref<SpotifyTrack | null>(null);

    const fetchTrack = async () => {
      try {
        track.value = await getCurrentTrack(props.token);
      } catch (error) {
        console.error('Error fetching track:', error);
        track.value = null;
      }
    };

    return {
      track,
      fetchTrack,
    };
  },
});
</script>