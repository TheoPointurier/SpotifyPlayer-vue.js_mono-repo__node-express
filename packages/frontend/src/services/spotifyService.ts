// src/services/spotifyService.ts
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const login = () => {
  window.location.href = `${BASE_URL}/auth/login`;
};

export const getCurrentTrack = async (token: string): Promise<SpotifyTrack> => {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch current track');
  }

  const data = await response.json();
  return data;
};

export const getUserPlaylists = async (token: string): Promise<SpotifyPlaylist[]> => {
  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch playlists');
  }

  const data = await response.json();
  return data.items;
};

export const getPlaylistTracks = async (token: string, playlistId: string): Promise<SpotifyPlaylistTrack[]> => {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch playlist tracks');
  }

  const data = await response.json();
  return data.items;
};