<!-- src/components/SpotifyPlayer.vue -->
<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { player } from '../services/spotifyPlayerSetup';
import { queue, currentTrackUri, setCurrentTrackUri } from '../services/playbackState';
import {
  initializePlayer,
  disconnectPlayer,
  togglePlayPause,
  nextTrack,
  previousTrack,
  toggleShuffle,
  seekToPosition,
} from '../services/spotifyPlayerService';

export default defineComponent({
  name: 'SpotifyPlayer',
  setup() {
    const track = ref<Spotify.PlaybackState['track_window']['current_track'] | null>(null);
    const progress = ref<number>(0);
    const duration = ref<number>(0);
    const isPlaying = ref<boolean>(false);
    const isShuffling = ref<boolean>(false);
    const isDragging = ref<boolean>(false);
    const volume = ref<number>(0.5);
    let progressInterval: NodeJS.Timeout | null = null;

    const loadSpotifySDK = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.Spotify) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;

        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log('Spotify Web Playback SDK is ready!');
          resolve();
        };

        script.onerror = () => {
          console.error('Erreur lors du chargement du Spotify SDK');
          reject(new Error('Erreur lors du chargement du Spotify SDK'));
        };

        document.head.appendChild(script);
      });
    };

    const startProgress = () => {
      stopProgress(); // S'assurer qu'il n'y a pas d'intervalle existant
      if (!isPlaying.value) return;

      progressInterval = setInterval(() => {
        if (isDragging.value) return; // Ne pas incrémenter si l'utilisateur est en train de draguer
        progress.value += 1000; // Incrémenter de 1 seconde (1000 ms)
        if (track.value && progress.value >= duration.value) {
          stopProgress();
          console.log('Piste terminée, passage à la suivante...');
          handleNextTrack();
        }
      }, 1000);
    };

    const stopProgress = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    };

    onMounted(async () => {
      try {
        await loadSpotifySDK();
        await initializePlayer();

        player.value?.addListener('player_state_changed', (state) => {
          if (!state) return;
          console.log('État du lecteur mis à jour:', state);
          console.log('Position actuelle:', state.position); // Log pour déboguer
          track.value = state.track_window.current_track;
          duration.value = state.duration;
          isPlaying.value = !state.paused;
          isShuffling.value = state.shuffle;

          if (!isDragging.value) {
            progress.value = state.position || 0;
          }

          if (track.value && track.value.uri !== currentTrackUri.value) {
            setCurrentTrackUri(track.value.uri);
          }

          if (isPlaying.value) {
            startProgress();
          } else {
            stopProgress();
          }
        });
      } catch (error) {
        console.error('Erreur lors de l’initialisation du Spotify SDK:', error);
        if ((error as Error).message.includes('Utilisateur non authentifié')) {
          window.location.href = '/login';
        }
      }
    });

    onUnmounted(() => {
      stopProgress();
      disconnectPlayer();
    });

    const formatDuration = (durationMs: number): string => {
      const totalSeconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');
      return `${formattedMinutes}:${formattedSeconds}`;
    };

    const handleTogglePlayPause = async () => {
      try {
        await togglePlayPause();
      } catch (error) {
        console.error('Erreur lors de togglePlayPause:', error);
      }
    };

    const handleNextTrack = async () => {
      try {
        await nextTrack();
        const currentIndex = queue.value.indexOf(currentTrackUri.value || '');
        if (currentIndex !== -1 && currentIndex < queue.value.length - 1) {
          setCurrentTrackUri(queue.value[currentIndex + 1]);
        }
      } catch (error) {
        console.error('Erreur lors de nextTrack:', error);
      }
    };

    const handlePreviousTrack = async () => {
      try {
        await previousTrack();
        const currentIndex = queue.value.indexOf(currentTrackUri.value || '');
        if (currentIndex !== -1 && currentIndex > 0) {
          setCurrentTrackUri(queue.value[currentIndex - 1]);
        }
      } catch (error) {
        console.error('Erreur lors de previousTrack:', error);
      }
    };

    const handleToggleShuffle = async () => {
      try {
        const newShuffleState = await toggleShuffle(isShuffling.value);
        isShuffling.value = newShuffleState;
      } catch (error) {
        console.error('Erreur lors de toggleShuffle:', error);
      }
    };

    const handleProgressDragStart = () => {
      isDragging.value = true;
    };

    const handleProgressDrag = (event: Event) => {
      if (!isDragging.value || !duration.value) return;
      const input = event.target as HTMLInputElement;
      const newProgress = (Number.parseFloat(input.value) / 100) * duration.value;
      progress.value = newProgress;
    };

    const handleProgressDragEnd = async (event: Event) => {
      if (!duration.value) return;
      const input = event.target as HTMLInputElement;
      const newProgress = (Number.parseFloat(input.value) / 100) * duration.value;
      try {
        await seekToPosition(newProgress);
        progress.value = newProgress;
      } catch (error) {
        console.error('Erreur lors du seek:', error);
        alert('Erreur lors du seek. Veuillez réessayer.');
      } finally {
        isDragging.value = false;
      }
    };

    const handleVolumeChange = async () => {
      if (!player.value) return;
      try {
        await player.value.setVolume(volume.value);
      } catch (error) {
        console.error('Erreur lors du changement de volume:', error);
      }
    };

    return {
      track,
      progress,
      duration,
      isPlaying,
      isShuffling,
      handleTogglePlayPause,
      handleNextTrack,
      handlePreviousTrack,
      handleToggleShuffle,
      formatDuration,
      handleProgressDragStart,
      handleProgressDrag,
      handleProgressDragEnd,
      handleVolumeChange,
      volume,
    };
  },
});
</script>

<template>
  <div class="player card">
    <div v-if="track" class="track-info">
      <img :src="track.album.images[0]?.url" alt="Album cover" class="album-cover" />
      <div class="track-details">
        <p class="track-name">{{ track.name }}</p>
        <p class="artist-name">{{ track.artists[0].name }}</p>
      </div>
    </div>
    <div v-else class="no-track">No track playing</div>
    <div class="controls">
      <div class="main-controls">
        <button class="control-button" title="Repeat">
          <i class="fas fa-redo"></i>
        </button>
        <button class="control-button" @click="handlePreviousTrack" title="Previous">
          <i class="fas fa-backward"></i>
        </button>
        <button class="control-button play-pause" @click="handleTogglePlayPause" :title="isPlaying ? 'Pause' : 'Play'">
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
        <button class="control-button" @click="handleNextTrack" title="Next">
          <i class="fas fa-forward"></i>
        </button>
        <button class="control-button" @click="handleToggleShuffle" :class="{ active: isShuffling }" title="Shuffle">
          <i class="fas fa-shuffle"></i>
        </button>
      </div>
      <div class="progress-container">
        <span class="progress-time">{{ formatDuration(progress) }}</span>
        <div class="progress-bar">
          <input type="range" min="0" max="100" step="1" :value="duration ? (progress / duration) * 100 : 0"
            @mousedown="handleProgressDragStart" @input="handleProgressDrag" @mouseup="handleProgressDragEnd"
            @touchstart="handleProgressDragStart" @touchmove="handleProgressDrag" @touchend="handleProgressDragEnd"
            class="progress-slider" aria-label="Progression de la lecture"
            :aria-valuenow="duration ? (progress / duration) * 100 : 0" aria-valuemin="0" aria-valuemax="100"
            :aria-valuetext="`${formatDuration(progress)} de ${formatDuration(duration)}`" />
          <div class="progress-fill" :style="{ width: `${duration ? (progress / duration) * 100 : 0}%` }"></div>
        </div>
        <span class="progress-time">{{ track ? formatDuration(track.duration_ms) : '00:00' }}</span>
      </div>
    </div>
    <div class="other-controls">
      <button class="control-button" title="Volume">
        <i class="fas fa-volume-up"></i>
      </button>
      <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="handleVolumeChange" aria-label="Volume"
        :aria-valuenow="volume * 100" aria-valuemin="0" aria-valuemax="100"
        :aria-valuetext="`${Math.round(volume * 100)}%`" />
    </div>
  </div>
</template>

<style scoped>
.player {
  padding: 0 0.5rem;
  width: 100%;
  grid-column: 1 / 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-height: 20vh;
}

.track-info {
  margin-left: 1rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.album-cover {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.track-details {
  height: 50%;
  flex: 1;
  flex-shrink: 1;
  align-content: center;
}

.track-name {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 4px;
}

.artist-name {
  font-size: 14px;
  color: var(--spotify-light-grey);
  margin-bottom: 8px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 1rem;
}

.progress-time {
  font-size: 12px;
  color: var(--spotify-light-grey);
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: var(--spotify-light-grey);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  /* Ajout pour position: absolute */
}

.progress-bar:hover {
  height: 6px;
}

.progress-fill {
  height: 100%;
  background-color: var(--spotify-green);
  transition: width 0.1s linear;
}

.progress-slider {
  position: absolute;
  /* Remettre position: absolute */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.progress-bar:hover .progress-fill {
  background-color: #1ed760;
}

.no-track {
  font-size: 16px;
  color: var(--spotify-light-grey);
  justify-self: start;
}

.controls {
  display: flex;
  flex-direction: column;
  width: 50%;
}

.main-controls {
  display: flex;
  gap: 16px;
  justify-content: center;
  width: 50%;
  margin: 0 auto;
}

.control-button {
  background-color: transparent;
  border: none;
  color: var(--spotify-white);
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.control-button:hover {
  color: var(--spotify-green);
}

.control-button.active {
  color: var(--spotify-green);
}

.play-pause {
  background-color: var(--spotify-green);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-pause:hover {
  background-color: #1ed760;
}
</style>