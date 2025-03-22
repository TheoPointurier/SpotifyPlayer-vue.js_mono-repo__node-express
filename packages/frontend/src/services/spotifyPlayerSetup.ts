// src/services/spotifyPlayerSetup.ts
import { ref } from 'vue';

export const player = ref<Spotify.Player | null>(null);
export const deviceId = ref<string | null>(null);
export const isPlayerReady = ref<boolean>(false);

