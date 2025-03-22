<!-- src/components/PlaylistSelector.vue -->
<template>
  <div>
    <h2>Mes Playlists</h2>
    <ul>
      <li v-for="playlist in playlists" :key="playlist.id">
        <button @click="selectPlaylist(playlist)">
          {{ playlist.name }}
        </button>
      </li>
    </ul>

    <div v-if="selectedPlaylist">
      <h3>{{ selectedPlaylist.name }}</h3>
      <ul>
        <li v-for="item in tracks" :key="item.track.id">
          {{ item.track.name }} - {{ item.track.artists[0].name }}
          <button @click="handlePlayTrack(item.track.uri)" :disabled="!isPlayerReady">Play</button>
        </li>
      </ul>
    </div>
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