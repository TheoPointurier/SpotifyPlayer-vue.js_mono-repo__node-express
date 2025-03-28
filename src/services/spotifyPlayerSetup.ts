// centralized state for the Spotify player
import { ref } from 'vue';

export const player = ref<Spotify.Player | null>(null);
export const deviceId = ref<string | null>(null);
export const isPlayerReady = ref<boolean>(false);

