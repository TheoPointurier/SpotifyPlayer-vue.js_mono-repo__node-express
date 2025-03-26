import { deviceId } from "./spotifyPlayerSetup";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const login = () => {
  window.location.href = `${BASE_URL}/auth/login`;
};

export const getUserPlaylists = async (): Promise<SpotifyPlaylist[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/spotify/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        method: 'GET',
        path: '/v1/me/playlists',
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Non authentifié. Veuillez vous reconnecter.');
      }
      const errorText = await response.text();
      throw new Error(`Erreur lors de la récupération des playlists: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPlaylistTracks = async (playlistId: string): Promise<SpotifyPlaylistTrack[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/spotify/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        method: 'GET',
        path: `/v1/playlists/${playlistId}/tracks`,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Non authentifié. Veuillez vous reconnecter.');
      }
      const errorText = await response.text();
      throw new Error(`Erreur lors de la récupération des pistes: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const playTrack = async (trackUri: string, queue: string[]): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/spotify/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        method: 'PUT',
        path: `/v1/me/player/play?device_id=${deviceId.value}`,
        body: {
          uris: queue,
          offset: { uri: trackUri },
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 204) {
        console.log('Piste jouée avec succès:', trackUri);
        return;
      }
      const errorText = await response.text();
      throw new Error(`Erreur lors de la lecture de la piste: ${response.status} - ${errorText}`);
    }

    console.log('Piste jouée avec succès:', trackUri);
  } catch (error) {
    console.error('Erreur lors de la lecture de la piste:', error);
    throw error;
  }
};

export const addTrackToPlaylist = async (playlistId: string, trackUri: string): Promise<void> => {

  try {
    const response = await fetch(`${BASE_URL}/api/spotify/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        method: 'POST',
        path: `/v1/playlists/${playlistId}/tracks`,
        body: JSON.stringify({
          uris: [trackUri],
        }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de l'ajout à la playlist: ${response.status} - ${errorText}`);
    }

    console.log(`Piste ${trackUri} ajoutée à la playlist ${playlistId} avec succès:`);
  } catch (error) {
    console.error(`Erreur lors de l'ajout à la playlist`, error);
      throw error
  }
}