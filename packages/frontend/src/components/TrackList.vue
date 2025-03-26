<!-- src/components/TrackList.vue -->
<template>
  <div class="tracks-section">
    <h3>{{ selectedPlaylist?.name || 'No Playlist Selected' }}</h3>
    <table class="track-table">
      <thead>
        <tr>
          <th class="number-title-bar">#</th>
          <th>Track</th>
          <th>Album</th>
          <th class="timer-bar"><i class="fa-solid fa-clock"></i></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tracks" :key="item.track.id" class="track-item"
          @click="handlePlayTrack(item.track.uri)" :class="{ disabled: !isPlayerReady }">
          <td class="track-number-container">
            <p class="track-number">{{ index + 1 }}</p>
            <button class="button-primary play-button">Play</button>
          </td>
          <td class="track-info">
            <img :src="item.track.album.images[2]?.url" alt="Album cover" class="track-album-cover" />
            <div>
              <p class="track-name">{{ item.track.name }}</p>
              <p class="artist-name">{{ item.track.artists[0].name }}</p>
            </div>
            <!-- <button class="add-to-playlist-button" @click.stop="handleAddToPlaylist(item.track.uri)"
              title="Add to Playlist">
              <i class="fas fa-plus"></i>
            </button> -->
          </td>
          <td>{{ item.track.album.name }}</td>
          <td>{{ formatDuration(item.track.duration_ms) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { isPlayerReady } from '../services/spotifyPlayerSetup';
import { queue, addToQueue, setCurrentTrackUri } from '../services/playbackState';
import { playTrack, addTrackToPlaylist } from '../services/spotifyService';
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
      // console.log('Attempting to play track:', trackUri);
      // console.log('isPlayerReady:', isPlayerReady.value);
      // console.log('Queue actuelle:', queue.value);

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

    const formatDuration = (durationMs: number): string => {
      const totalSeconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60; // Calculer les secondes restantes
      // Add 0 padding to seconds
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');
      return `${formattedMinutes}:${formattedSeconds}`;
    };

    const handleAddToPlaylist = async (trackUri: string) => {
      try {
        const playlistId = 'ID_DE_TA_PLAYLIST'; // TO replace with good logic
        await addTrackToPlaylist(playlistId, trackUri);
        alert('Piste ajoutée à la playlist !');
      } catch (error) {
        console.error('Erreur lors de l’ajout à la playlist:', error);
        alert('Erreur lors de l’ajout à la playlist.');
      }
    };

    return {
      formatDuration,
      handlePlayTrack,
      handleAddToPlaylist,
    };
  },
});
</script>

<style scoped>
.tracks-section {
  height: 100%;
  width: 100%;
  grid-column: 2 / 3;
  text-align: center;
  color: var(--spotify-light-grey);
  scrollbar-width: thin;
  scrollbar-color: var(--spotify-white) transparent;

  &::-webkit-scrollbar {
    width: 8px;
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
  }
}

.add-to-playlist-button {
  background: none;
  border: none;
  color: var(--spotify-white);
  font-size: 14px;
  cursor: pointer;
  margin-left: 8px;
}

.add-to-playlist-button:hover {
  color: var(--spotify-green);
}

.track-table {
  width: 100%;
  border-collapse: collapse;
}

.track-table thead {
  position: sticky;
  top: 0;
  background-color: #1a1a1a;
  color: var(--spotify-light-grey);
  font-size: 14px;
}

.track-table th,
.track-table td {
  padding: 12px;
  text-align: left;
}

.track-item {
  border-bottom: 1px solid #2a2a2a;
}

.track-item:hover {
  background-color: #2a2a2a;
  cursor: pointer;
  width: 100%;
}

.track-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.track-table .number-title-bar,
.track-table .timer-bar {
  text-align: center;
}

.track-number {
  font-size: 14px;
  color: var(--spotify-light-grey);
  text-align: center;
  opacity: 1;
  transition: opacity 0.5s ease;
}

.track-number-container {
  width: 5rem;
}

.track-info {
  display: flex;
  gap: 1rem;
}

.track-album-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
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
  /* padding: 6px 12px; */
  font-size: 12px;
  display: none;
  opacity: 0;
  transition: opacity 1s ease;
  justify-self: center;
}

.track-item:hover .play-button {
  display: block;
  opacity: 1;
}

.track-item:hover .track-number {
  display: none;
  opacity: 0;
}

.track-item:hover .track-name {
  color: var(--spotify-green);
}

@media screen and (max-width: 768px) {
  .tracks-section {
    grid-column: 1/2;
    grid-row: 2/3;
    width: 100dvw;
    overflow-x: hidden;

  }

  .tracks-section h3 {
    margin-top: 0.5rem;
  }

  .track-table {
    width: 100%;
    table-layout: fixed;

  }

  /* Masquer les colonnes # et Album */
  .track-table .number-title-bar,
  .track-table th:nth-child(3),
  /* Album */
  .track-table td:nth-child(1),
  /* # */
  .track-table td:nth-child(3)

  /* Album */
    {
    display: none;
  }

  .track-table th,
  .track-table td {
    padding: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .track-info {
    width: 80%;
    gap: 0.5rem;
  }

  .track-info img {
    width: 30px;
    height: 30px;
  }

  .track-info .track-name,
  .track-info .artist-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .track-table .timer-bar,
  .track-table td:nth-child(4) {
    width: 20%;
    text-align: center;
  }
}
</style>