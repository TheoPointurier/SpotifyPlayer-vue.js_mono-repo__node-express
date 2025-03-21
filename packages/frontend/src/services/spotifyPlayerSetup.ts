// src/services/spotifyPlayerSetup.ts
import { ref } from 'vue';

// Variables réactives pour partager l'état globalement
export const player = ref<Spotify.Player | null>(null);
export const deviceId = ref<string | null>(null);
export const isPlayerReady = ref<boolean>(false);

export const initializeSpotifyPlayer = (token: string) => {
  // Vérifier si le SDK est prêt
  if (!window.spotifySDKReady) {
    console.log('Spotify SDK not ready yet. Waiting...');
    const checkSDKReady = setInterval(() => {
      if (window.spotifySDKReady) {
        clearInterval(checkSDKReady);
        setupPlayer(token);
      }
    }, 100);
  } else {
    setupPlayer(token);
  }
};

const setupPlayer = (token: string) => {
  console.log('Setting up Spotify Player with token:', token);

  // Redéfinir onSpotifyWebPlaybackSDKReady pour initialiser le lecteur
  window.onSpotifyWebPlaybackSDKReady = () => {
    console.log('Spotify Web Playback SDK is ready! Initializing player...');

    player.value = new Spotify.Player({
      name: 'Mon Lecteur Web',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(token);
      },
      volume: 0.5,
    });

    // Événements du lecteur
    player.value.addListener('ready', ({ device_id }) => {
      console.log('Lecteur prêt avec Device ID:', device_id);
      deviceId.value = device_id;

      // Vérifier que la connexion est bien établie
      player.value?.connect().then((success) => {
        if (success) {
          console.log('Lecteur connecté avec succès !');
          isPlayerReady.value = true;
        } else {
          console.error('Échec de la connexion du lecteur.');
        }
      });
    });

    player.value.addListener('not_ready', ({ device_id }) => {
      console.log('Lecteur hors ligne avec Device ID:', device_id);
      isPlayerReady.value = false;
    });

    // // Ajouter un listener pour les erreurs d'initialisation
    // player.value.addListener('initialization_error', ({ message }) => {
    //   console.error('Erreur d’initialisation du lecteur:', message);
    // });

    // Connecter le lecteur
    player.value.connect();
  };

  // Si le SDK est déjà chargé, appeler manuellement la fonction
  if (window.spotifySDKReady) {
    window.onSpotifyWebPlaybackSDKReady();
  }
};

// Fonction pour nettoyer le lecteur
export const cleanupSpotifyPlayer = () => {
  if (player.value) {
    player.value.disconnect();
    player.value = null;
    deviceId.value = null;
    isPlayerReady.value = false;
  }
};