<!-- src/components/SpotifyPlayer.vue -->
<template>
  <div class="player card">
    <h2>Now Playing</h2>
    <div v-if="track" class="track-info">
      <img :src="track.album.images[0]?.url" alt="Album cover" class="album-cover" />
      <div class="track-details">
        <p class="track-name">{{ track.name }}</p>
        <p class="artist-name">{{ track.artists[0].name }}</p>
        <div class="progress-container">
          <span class="progress-time">{{ Math.floor(progress / 1000) }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(progress / track.duration_ms) * 100}%` }"></div>
          </div>
          <span class="progress-time">{{ Math.floor(track.duration_ms / 1000) }}</span>
        </div>
      </div>
    </div>
    <p v-else class="no-track">No track playing</p>
    <div class="controls">
      <button class="control-button" @click="previousTrack" title="Previous">
        <i class="fas fa-backward"></i>
      </button>
      <button class="control-button play-pause" @click="togglePlayPause" :title="isPlaying ? 'Pause' : 'Play'">
        <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
      </button>
      <button class="control-button" @click="nextTrack" title="Next">
        <i class="fas fa-forward"></i>
      </button>
      <button class="control-button" @click="toggleShuffle" :class="{ active: isShuffling }" title="Shuffle">
        <i class="fas fa-shuffle"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { player, isPlayerReady, deviceId } from '../services/spotifyPlayerSetup';
import { queue, currentTrackUri, setCurrentTrackUri } from '../services/playbackState';

export default defineComponent({
  name: 'SpotifyPlayer',
  props: {
    token: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const track = ref<Spotify.PlaybackState['track_window']['current_track'] | null>(null);
    const progress = ref<number>(0);
    const isPlaying = ref<boolean>(false);
    const isShuffling = ref<boolean>(false);
    let progressInterval: NodeJS.Timeout | null = null;

    // Charger le SDK dynamiquement
    const loadSpotifySDK = () => {
      return new Promise<void>((resolve, reject) => {
        // Vérifier si le SDK est déjà chargé
        if (window.Spotify) {
          resolve();
          return;
        }

        // Créer une balise script pour charger le SDK
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;

        // Définir la fonction onSpotifyWebPlaybackSDKReady
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

    // Initialiser le player Spotify
    const initializePlayer = () => {
      if (!window.Spotify || !props.token) {
        console.log('Spotify SDK ou token manquant');
        return;
      }

      player.value = new window.Spotify.Player({
        name: 'Vue Spotify Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(props.token);
        },
        volume: 0.5,
      });

      // Ajouter les listeners
      player.value.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        deviceId.value = device_id;
        isPlayerReady.value = true;
      });

      player.value.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        isPlayerReady.value = false;
      });

      player.value.addListener('player_state_changed', (state) => {
        if (!state) return;
        console.log('État du lecteur mis à jour:', state);
        track.value = state.track_window.current_track;
        progress.value = state.position;
        isPlaying.value = !state.paused;
        isShuffling.value = state.shuffle;

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

      // Connecter le player
      player.value.connect().then((success: boolean) => {
        if (success) {
          console.log('Player connecté avec succès !');
        } else {
          console.error('Échec de la connexion du player');
        }
      });
    };

    // Charger et initialiser le SDK au montage du composant
    onMounted(async () => {
      try {
        await loadSpotifySDK();
        initializePlayer();
      } catch (error) {
        console.error('Erreur lors de l’initialisation du Spotify SDK:', error);
      }
    });

    // Nettoyer lors de la destruction du composant
    onUnmounted(() => {
      stopProgress();
      if (player.value) {
        player.value.disconnect();
        player.value = null;
        isPlayerReady.value = false;
      }
    });

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

    const ensureDeviceActive = async () => {
      if (!deviceId.value || !props.token) {
        console.error('Device ID ou token non disponible');
        return false;
      }

      try {
        // Verify if the device is already active
        const response = await fetch('https://api.spotify.com/v1/me/player', {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.device && data.device.id === deviceId.value) {
            console.log('Appareil déjà actif !');
            return true;
          }
        }

        // If not, transfer the playback to our device
        console.log('Transfert de la lecture vers notre appareil...');
        const transferResponse = await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${props.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_ids: [deviceId.value],
            play: false,
          }),
        });

        if (!transferResponse.ok) {
          console.error('Erreur lors du transfert de la lecture:', transferResponse.statusText);
          return false;
        }

        console.log('Lecture transférée avec succès vers notre appareil !');
        return true;
      } catch (error) {
        console.error('Erreur lors de la vérification/transfert de l’appareil:', error);
        return false;
      }
    };

    // Passer à la piste suivante
    const nextTrack = async () => {
      if (!player.value) {
        console.error('Player non initialisé');
        return;
      }

      const isDeviceActive = await ensureDeviceActive();
      if (!isDeviceActive) {
        console.error('Impossible d’exécuter la commande : appareil non actif');
        return;
      }

      try {
        await player.value.nextTrack();
        console.log('Piste suivante');
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
      if (!player.value) {
        console.error('Player non initialisé');
        return;
      }

      const isDeviceActive = await ensureDeviceActive();
      if (!isDeviceActive) {
        console.error('Impossible d’exécuter la commande : appareil non actif');
        return;
      }

      try {
        await player.value.previousTrack();
        console.log('Piste précédente');
        const currentIndex = queue.value.indexOf(currentTrackUri.value || '');
        if (currentIndex !== -1 && currentIndex > 0) {
          setCurrentTrackUri(queue.value[currentIndex - 1]);
        }
      } catch (error) {
        console.error('Erreur lors du retour à la piste précédente:', error);
      }
    };

    // Activer/désactiver le mode shuffle
    // Dans SpotifyPlayer.vue
    const toggleShuffle = async () => {
      if (!player.value) {
        console.error('Player non initialisé');
        return;
      }

      const isDeviceActive = await ensureDeviceActive();
      if (!isDeviceActive) {
        console.error('Impossible d’exécuter la commande : appareil non actif');
        return;
      }

      try {
        // Utiliser l’API Spotify pour activer/désactiver le shuffle
        const newShuffleState = !isShuffling.value;
        const response = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${newShuffleState}&device_id=${deviceId.value}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${props.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur lors de la gestion du shuffle: ${response.statusText}`);
        }

        console.log(newShuffleState ? 'Shuffle activé via API' : 'Shuffle désactivé via API');

        // Mettre à jour l’état local (l’événement player_state_changed devrait aussi le faire)
        isShuffling.value = newShuffleState;

        // Optionnel : Appeler toggleShuffle du SDK pour synchroniser
        // await player.value.toggleShuffle(newShuffleState);
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
          nextTrack();
        }
      }, 1000);
    };

    const stopProgress = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    };

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
<style scoped>
.player {
  grid-column: 1 / 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  max-height: 300px;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.album-cover {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.track-details {
  flex: 1;
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
}

.progress-fill {
  height: 100%;
  background-color: var(--spotify-green);
  transition: width 0.1s linear;
}

.no-track {
  font-size: 16px;
  color: var(--spotify-light-grey);
}

.controls {
  display: flex;
  gap: 16px;
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