// src/services/playbackState.ts
import { ref } from 'vue';

// File d'attente locale
export const queue = ref<string[]>([]);

// Piste en cours
export const currentTrackUri = ref<string | null>(null);

// Fonction pour ajouter une piste à la file d'attente
export const addToQueue = (trackUri: string) => {
  if (!queue.value.includes(trackUri)) {
    queue.value.push(trackUri);
  }
};

// Fonction pour définir la piste en cours
export const setCurrentTrackUri = (trackUri: string) => {
  currentTrackUri.value = trackUri;
};

// Fonction pour vider la file d'attente
export const clearQueue = () => {
  queue.value = [];
};