<!-- src/components/PlaylistSelector.vue -->
<template>
  <div class="playlist-selector">
    <h2>Mes Playlists</h2>
    <section class="playlists-section">
      <ul class="playlist-list">
        <li v-for="playlist in playlists" :key="playlist.id" class="playlist-item card">
          <button class="playlist-button" @click="selectPlaylist(playlist)">
            {{ playlist.name }}
          </button>
        </li>
      </ul>

      <div v-if="selectedPlaylist" class="tracks-section">
        <h3>{{ selectedPlaylist.name }}</h3>
        <ul class="track-list">
          <li v-for="item in tracks" :key="item.track.id" class="track-item card">
            <div class="track-info">
              <span class="track-name">{{ item.track.name }}</span>
              <span class="artist-name">{{ item.track.artists[0].name }}</span>
            </div>
            <button class="button-primary play-button" @click="handlePlayTrack(item.track.uri)"
              :disabled="!isPlayerReady">
              Play
            </button>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getUserPlaylists, getPlaylistTracks } from '../services/spotifyService';
import { deviceId, isPlayerReady, player } from '../services/spotifyPlayerSetup';
import { queue, addToQueue, setCurrentTrackUri, clearQueue } from '../services/playbackState';

export default defineComponent({
  name: 'PlaylistSelector',
  props: {
    token: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const playlists = ref<SpotifyPlaylist[]>([]);
    const selectedPlaylist = ref<SpotifyPlaylist | null>(null);
    const tracks = ref<SpotifyPlaylistTrack[]>([]);
    const hasInitializedContext = ref<boolean>(false);

    const fetchPlaylists = async () => {
      try {
        playlists.value = await getUserPlaylists(props.token);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    const selectPlaylist = async (playlist: SpotifyPlaylist) => {
      selectedPlaylist.value = playlist;
      try {
        tracks.value = await getPlaylistTracks(props.token, playlist.id);
        // Vider la file d'attente actuelle
        clearQueue();
        // Ajouter les pistes de la playlist à la file d'attente
        for (const track of tracks.value) {
          addToQueue(track.track.uri);
        }
      } catch (error) {
        console.error('Error fetching playlist tracks:', error);
      }
    };

    const handlePlayTrack = async (trackUri: string) => {
      console.log('Attempting to play track:', trackUri);
      console.log('isPlayerReady:', isPlayerReady.value);
      console.log('deviceId:', deviceId.value);
      console.log('Queue actuelle:', queue.value); // Ajouter ce log

      try {
        if (!isPlayerReady.value || !deviceId.value || !player.value) {
          console.log('Le lecteur n’est pas prêt. Attente...');
          let attempts = 0;
          const maxAttempts = 10;
          while (!isPlayerReady.value && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            attempts++;
            console.log(`Attente du lecteur... Tentative ${attempts}/${maxAttempts}`);
          }

          if (!isPlayerReady.value || !deviceId.value || !player.value) {
            throw new Error('Le lecteur n’est pas prêt après attente. Veuillez réessayer.');
          }
        }

        addToQueue(trackUri);
        setCurrentTrackUri(trackUri);

        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${props.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: queue.value,
            offset: { uri: trackUri },
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur lors de la définition du contexte de lecture: ${response.statusText}`);
        }

        hasInitializedContext.value = true;

        await player.value.resume().then(() => {
          console.log('Lecture reprise avec succès via le SDK !');
        });
        console.log('Piste lancée avec succès via le SDK !');
      } catch (error) {
        console.error('Erreur lors de la lecture de la piste:', error);
        alert('Erreur lors de la lecture de la piste. Veuillez réessayer.');
      }
    };


    onMounted(fetchPlaylists);

    return {
      playlists,
      selectedPlaylist,
      tracks,
      selectPlaylist,
      handlePlayTrack,
      isPlayerReady,
    };
  },
});
</script>
<style scoped>
.playlist-selector {
  grid-column: 3 / 4;
  max-height: 100%;
  overflow-y: scroll;
  width: 42rem;
}

.playlist-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.playlists-section {
  display: flex;
}

.playlist-item {
  padding: 12px;
}

.playlist-button {
  background: none;
  border: none;
  color: var(--spotify-white);
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  width: 100%;
  cursor: pointer;
}

.tracks-section {
  margin-top: 24px;
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.track-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
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
</style>