import { player, deviceId, isPlayerReady } from './spotifyPlayerSetup';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const initializePlayer = async (): Promise<void> => {
  if (!window.Spotify) {
    throw new Error('Spotify SDK manquant');
  }

  player.value = new window.Spotify.Player({
    name: 'Vue Spotify Player',
    getOAuthToken: async (cb: (token: string) => void) => {
      try {
        const response = await fetch(`${BASE_URL}/auth/get-token`, {
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Utilisateur non authentifié. Redirection vers la connexion...');
          }
          throw new Error('Erreur lors de la récupération du token');
        }
        const data = await response.json();
        cb(data.access_token);
      } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
        cb('');
      }
    },
    volume: 0.5,
  });

  player.value.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    deviceId.value = device_id;
    isPlayerReady.value = true;
  });

  player.value.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
    isPlayerReady.value = false;
  });

  const success = await player.value.connect();
  if (!success) {
    throw new Error('Échec de la connexion du player');
  }
};

export const disconnectPlayer = (): void => {
  if (player.value) {
    player.value.disconnect();
    player.value = null;
    isPlayerReady.value = false;
    deviceId.value = null;
  }
};

export const togglePlayPause = async (): Promise<void> => {
  if (!player.value) {
    throw new Error('Player non initialisé');
  }

  try {
    if (isPlayerReady.value) {
      const state = await player.value.getCurrentState();
      if (state?.paused) {
        await player.value.resume();
        console.log('Lecture reprise');
      } else {
        await player.value.pause();
        console.log('Lecture mise en pause');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la lecture/pause:', error);
    throw error;
  }
};

export const nextTrack = async (): Promise<void> => {
  if (!player.value) {
    throw new Error('Player non initialisé');
  }

  const isDeviceActive = await ensureDeviceActive();
  if (!isDeviceActive) {
    throw new Error('Impossible d’exécuter la commande : appareil non actif');
  }

  try {
    await player.value.nextTrack();
    console.log('Piste suivante');
  } catch (error) {
    console.error('Erreur lors du passage à la piste suivante:', error);
    throw error;
  }
};

export const previousTrack = async (): Promise<void> => {
  if (!player.value) {
    throw new Error('Player non initialisé');
  }

  const isDeviceActive = await ensureDeviceActive();
  if (!isDeviceActive) {
    throw new Error('Impossible d’exécuter la commande : appareil non actif');
  }

  try {
    await player.value.previousTrack();
    console.log('Piste précédente');
  } catch (error) {
    console.error('Erreur lors du retour à la piste précédente:', error);
    throw error;
  }
};

export const toggleShuffle = async (currentShuffleState: boolean): Promise<boolean> => {
  if (!player.value) {
    throw new Error('Player non initialisé');
  }

  const isDeviceActive = await ensureDeviceActive();
  if (!isDeviceActive) {
    throw new Error('Impossible d’exécuter la commande : appareil non actif');
  }

  try {
    const newShuffleState = !currentShuffleState;
    const response = await fetch(`${BASE_URL}/api/spotify/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        method: 'PUT',
        path: `/v1/me/player/shuffle?state=${newShuffleState}&device_id=${deviceId.value}`,
      }),
    });

    if (!response.ok) {
      if (response.status === 204) {
        console.log(newShuffleState ? 'Shuffle activé via API' : 'Shuffle désactivé via API');
        return newShuffleState;
      }
      const errorText = await response.text();
      throw new Error(`Erreur lors de la gestion du shuffle: ${response.status} - ${errorText}`);
    }

    console.log(newShuffleState ? 'Shuffle activé via API' : 'Shuffle désactivé via API');
    return newShuffleState;
  } catch (error) {
    console.error('Erreur lors de la gestion du shuffle:', error);
    throw error;
  }
};

export const ensureDeviceActive = async (): Promise<boolean> => {
  if (!deviceId.value) {
    console.error('Device ID non disponible');
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/spotify/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        method: 'GET',
        path: '/v1/me/player',
      }),
    });

    if (response.status === 401) {
      console.error('Utilisateur non authentifié. Redirection vers la connexion...');
      window.location.href = '/login';
      return false;
    }

    if (response.status === 204) {
      console.log('Aucun appareil actif détecté (204)');
    } else if (response.ok) {
      const data = await response.json();
      if (data?.device && data.device.id === deviceId.value) {
        console.log('Appareil déjà actif !');
        return true;
      }
      if (!data?.device) {
        console.log('Aucun appareil actif détecté');
      }
    } else {
      const errorText = await response.text();
      console.error('Erreur lors de la vérification de l’appareil:', errorText);
      throw new Error(`Erreur lors de la vérification de l’appareil: ${errorText}`);
    }

    console.log('Transfert de la lecture vers notre appareil...');
    const transferResponse = await fetch(`${BASE_URL}/api/spotify/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        method: 'PUT',
        path: '/v1/me/player',
        body: {
          device_ids: [deviceId.value],
          play: false,
        },
      }),
    });

    if (transferResponse.status === 401) {
      console.error('Utilisateur non authentifié. Redirection vers la connexion...');
      window.location.href = '/login';
      return false;
    }

    if (!transferResponse.ok) {
      if (transferResponse.status === 204) {
        console.log('Lecture transférée avec succès vers notre appareil !');
        return true;
      }
      const errorText = await transferResponse.text();
      console.error('Erreur lors du transfert de la lecture:', errorText);
      throw new Error(`Erreur lors du transfert de la lecture: ${errorText}`);
    }

    console.log('Lecture transférée avec succès vers notre appareil !');
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification/transfert de l’appareil:', error);
    throw error;
  }
};

export const seekToPosition = async (positionMs: number): Promise<void> => {
  if (!deviceId.value) {
    throw new Error('Device ID non disponible');
  }

  const isDeviceActive = await ensureDeviceActive();
  if (!isDeviceActive) {
    throw new Error('Impossible d’exécuter la commande : appareil non actif');
  }

  try {
    const response = await fetch(`${BASE_URL}/api/spotify/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        method: 'PUT',
        path: `/v1/me/player/seek?device_id=${deviceId.value}&position_ms=${Math.floor(positionMs)}`,
      }),
    });

    if (!response.ok) {
      if (response.status === 204) {
        console.log(`Position changée à ${positionMs} ms`);
        return;
      }
      const errorText = await response.text();
      throw new Error(`Erreur lors du changement de position: ${response.status} - ${errorText}`);
    }

    console.log(`Position changée à ${positionMs} ms`);
  } catch (error) {
    console.error('Erreur lors du changement de position:', error);
    throw error;
  }
};