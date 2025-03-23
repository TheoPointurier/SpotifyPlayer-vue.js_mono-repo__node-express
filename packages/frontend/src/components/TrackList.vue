<!-- src/components/TrackList.vue -->
<template>
  <div class="tracks-section">
    <h3>{{ selectedPlaylist?.name || 'No Playlist Selected' }}</h3>
    <ul class="track-list">
      <li v-for="(item, index) in tracks" :key="item.track.id" class="track-item card"
        @click="handlePlayTrack(item.track.uri)" :disabled="!isPlayerReady">
        <button class="button-primary play-button">
          Play
        </button>
        <span class="track-number">{{ index + 1 }}</span>
        <img :src="item.track.album.images[2]?.url" alt="Album cover" class="track-album-cover" />
        <div class="track-info">
          <span class="track-name">{{ item.track.name }}</span>
          <span class="artist-name">{{ item.track.artists[0].name }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { isPlayerReady } from '../services/spotifyPlayerSetup';
import { queue, addToQueue, setCurrentTrackUri } from '../services/playbackState';
import { playTrack } from '../services/spotifyService';
import { ensureDeviceActive } from '../services/spotifyPlayerService';

export default defineComponent({
  name: 'TrackList',
  props: {
    selectedPlaylist: {
      type: Object as () => SpotifyPlaylist | null,
      default: null,
    },
    tracks: {
      type: Array as () => SpotifyPlaylistTrack[],
      default: () => [],
    },
    isPlayerReady: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update-context'],
  setup(props, { emit }) {
    const handlePlayTrack = async (trackUri: string) => {
      console.log('Attempting to play track:', trackUri);
      console.log('isPlayerReady:', isPlayerReady.value);
      console.log('Queue actuelle:', queue.value);

      try {
        if (!isPlayerReady.value) {
          console.log('Le lecteur n’est pas prêt. Attente...');
          let attempts = 0;
          const maxAttempts = 10;
          while (!isPlayerReady.value && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            attempts++;
            console.log(`Attente du lecteur... Tentative ${attempts}/${maxAttempts}`);
          }

          if (!isPlayerReady.value) {
            throw new Error('Le lecteur n’est pas prêt après attente. Veuillez réessayer.');
          }
        }

        const isDeviceActive = await ensureDeviceActive();
        if (!isDeviceActive) {
          throw new Error('Impossible d’exécuter la commande : appareil non actif');
        }

        addToQueue(trackUri);
        setCurrentTrackUri(trackUri);
        await playTrack(trackUri, queue.value);

        emit('update-context', true);
      } catch (error) {
        console.error('Erreur lors de la lecture de la piste:', error);
        alert('Erreur lors de la lecture de la piste. Veuillez réessayer.');
      }
    };

    return {
      handlePlayTrack,
    };
  },
});
</script>

<style scoped>
.tracks-section {
  height: 100%;
  width: 100%;
  grid-column: 2 / 3;
  scrollbar-width: thin;
  /* For Firefox */
  scrollbar-color: var(--spotify-white) transparent;
  /* For Firefox */

  &::-webkit-scrollbar {
    width: 8px;
    /* For WebKit browsers */
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--spotify-white);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  overflow-y: auto;

  &:not(:hover)::-webkit-scrollbar-thumb {
    background-color: transparent;
    /* Hide scrollbar thumb when not hovering */
  }
}

.track-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
}

.track-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.track-number {
  width: 24px;
  font-size: 14px;
  color: var(--spotify-light-grey);
  text-align: center;
}

.track-album-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.track-info {
  flex: 1;
}

.track-name {
  font-size: 16px;
  font-weight: 500;
}

.artist-name {
  font-size: 14px;
  color: var(--spotify-light-grey);
}

.play-button {
  padding: 6px 12px;
  font-size: 12px;
}

.track-item:hover {
  background-color: #2a2a2a;
  cursor: pointer;
}

.track-item:hover .track-name {
  color: var(--spotify-green);
}
</style>