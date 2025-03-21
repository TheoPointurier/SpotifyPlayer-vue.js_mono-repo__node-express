<!-- src/components/SpotifyPlayer.vue -->
<template>
  <div>
    <h2>Now Playing</h2>
    <div v-if="track">
      <p>{{ track.name }} - {{ track.artists[0].name }}</p>
      <img :src="track.album.images[0]?.url" alt="Album cover" width="200" />
      <p>Progress: {{ Math.floor(progress / 1000) }} / {{ Math.floor(track.duration_ms / 1000) }} seconds</p>
      <div>
        <button @click="previousTrack">Précédent</button>
        <button @click="togglePlayPause">{{ isPlaying ? 'Pause' : 'Play' }}</button>
        <button @click="nextTrack">Suivant</button>
        <button @click="toggleShuffle">{{ isShuffling ? 'Désactiver Shuffle' : 'Activer Shuffle' }}</button>
      </div>
    </div>
    <p v-else>No track playing</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { player, isPlayerReady } from '../services/spotifyPlayerSetup';
import { queue, currentTrackUri, setCurrentTrackUri } from '../services/playbackState';

export default defineComponent({
  name: 'SpotifyPlayer',
  props: {
    token: {
      type: String,
      required: true,
    },
  },
  setup() {
    const track = ref<Spotify.PlaybackState['track_window']['current_track'] | null>(null);
    const progress = ref<number>(0);
    const isPlaying = ref<boolean>(false);
    const isShuffling = ref<boolean>(false);
    let progressInterval: NodeJS.Timeout | null = null;

    // Écouter les changements d’état du lecteur
    const setupPlayerListeners = () => {
      if (!player.value) return;

      player.value.addListener('player_state_changed', (state) => {
        if (!state) return;
        console.log('État du lecteur mis à jour:', state);
        track.value = state.track_window.current_track;
        progress.value = state.position;
        isPlaying.value = !state.paused;
        isShuffling.value = state.shuffle;

        // Mettre à jour la piste en cours
        if (track.value && track.value.uri !== currentTrackUri.value) {
          setCurrentTrackUri(track.value.uri);
        }

        if (isPlaying.value) {
          console.log('Lecture démarrée !');
          startProgress();
        } else {
          console.log('Lecture mise en pause.');
          stopProgress();
        }
      });

      // player.value.addListener('playback_error', ({ message }) => {
      //   console.error('Erreur de lecture:', message);
      // });
    };

    // Basculer entre lecture et pause
    const togglePlayPause = async () => {
      if (!player.value) return;
      try {
        if (isPlaying.value) {
          await player.value.pause();
          console.log('Lecture mise en pause');
        } else {
          await player.value.resume();
          console.log('Lecture reprise');
        }
      } catch (error) {
        console.error('Erreur lors de la gestion de la lecture/pause:', error);
      }
    };

    // Passer à la piste suivante
    const nextTrack = async () => {
      if (!player.value) return;
      try {
        await player.value.nextTrack();
        console.log('Piste suivante');
        // Mettre à jour la piste en cours
        const currentIndex = queue.value.indexOf(currentTrackUri.value || '');
        if (currentIndex !== -1 && currentIndex < queue.value.length - 1) {
          setCurrentTrackUri(queue.value[currentIndex + 1]);
        }
      } catch (error) {
        console.error('Erreur lors du passage à la piste suivante:', error);
      }
    };

    // Revenir à la piste précédente
    const previousTrack = async () => {
      if (!player.value) return;
      try {
        await player.value.previousTrack();
        console.log('Piste précédente');
        // Mettre à jour la piste en cours
        const currentIndex = queue.value.indexOf(currentTrackUri.value || '');
        if (currentIndex !== -1 && currentIndex > 0) {
          setCurrentTrackUri(queue.value[currentIndex - 1]);
        }
      } catch (error) {
        console.error('Erreur lors du retour à la piste précédente:', error);
      }
    };

    // Activer/désactiver le mode shuffle
    const toggleShuffle = async () => {
      if (!player.value) return;
      try {
        await player.value.toggleShuffle(!isShuffling.value);
        console.log(isShuffling.value ? 'Shuffle désactivé' : 'Shuffle activé');
      } catch (error) {
        console.error('Erreur lors de la gestion du shuffle:', error);
      }
    };

    // Gestion de la progression
    const startProgress = () => {
      stopProgress();
      progressInterval = setInterval(() => {
        progress.value += 1000;
        if (track.value && progress.value >= track.value.duration_ms) {
          stopProgress();
          console.log('Piste terminée, attente de la suivante...');
          nextTrack(); // Passer à la piste suivante automatiquement
        }
      }, 1000);
    };

    const stopProgress = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    };

    onMounted(() => {
      const checkPlayerReady = setInterval(() => {
        if (isPlayerReady.value && player.value) {
          setupPlayerListeners();
          clearInterval(checkPlayerReady);
        }
      }, 100);
    });

    onUnmounted(() => {
      stopProgress();
    });

    return {
      track,
      progress,
      isPlaying,
      isShuffling,
      togglePlayPause,
      nextTrack,
      previousTrack,
      toggleShuffle,
    };
  },
});
</script>