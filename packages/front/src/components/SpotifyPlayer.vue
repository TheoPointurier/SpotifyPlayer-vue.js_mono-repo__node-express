<template>
  <div>
    <div v-if="isReady">
      <h3>Ma Playlist Spotify</h3>
      <!-- Boutons de contrôle -->
      <button @click="playPause">Play/Pause</button>
      <button @click="nextTrack">Next</button>
      <button @click="prevTrack">Previous</button>

      <div>
        <p>Current track: {{ currentTrackName }}</p>
      </div>
    </div>
    <div v-else>
      Loading Spotify Player...
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpotifyPlayer',
  data() {
    return {
      player: null,
      isReady: false,
      currentTrackName: ''
    }
  },
  mounted() {
    this.initPlayer()
  },
  methods: {
    initPlayer() {
      window.onSpotifyWebPlaybackSDKReady = () => {
        this.player = new window.Spotify.Player({
          name: 'My Custom Spotify Player',
          getOAuthToken: cb => {
            // Récupérez le token (access_token) via votre backend
            fetch('/api/spotify/get-access-token')
              .then(res => res.json())
              .then(data => {
                cb(data.accessToken)
              })
          },
          volume: 0.5
        })

        // Evenements
        this.player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id)
          this.isReady = true
          // Vous pouvez transférer la lecture vers ce device (cf. Spotify API)
        })

        this.player.addListener('player_state_changed', (state) => {
          if (!state) return
          let currentTrack = state.track_window.current_track
          this.currentTrackName = currentTrack.name
        })

        this.player.addListener('initialization_error', ({ message }) => {
          console.error(message)
        })
        this.player.addListener('authentication_error', ({ message }) => {
          console.error(message)
        })
        this.player.addListener('account_error', ({ message }) => {
          console.error(message)
        })
        this.player.addListener('playback_error', ({ message }) => {
          console.error(message)
        })

        // Connect the player!
        this.player.connect()
      }
    },
    playPause() {
      // Ce genre de commande nécessite un endpoint Spotify
      // On peut utiliser l'API Web Playback pour play/pause sur le device_id
      // Cf. https://developer.spotify.com/documentation/web-api/reference/play
    },
    nextTrack() {
      // Idem, via l'API Web Playback /player/next
    },
    prevTrack() {
      // ...
    }
  }
}
</script>

<style scoped>
/* Un style s'approchant de Spotify */
</style>
