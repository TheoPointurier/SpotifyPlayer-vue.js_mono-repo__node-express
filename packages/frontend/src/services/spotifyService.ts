const BASE_URL = import.meta.env.VITE_BASE_URL
import type { SpotifyTrack } from '../../types/spotify'

export const login = () => {
  window.location.href = `${BASE_URL}/auth/login`
}

export const getCurrentTrack = async (token: string): Promise<SpotifyTrack> => {
  const response = await fetch('https://api.spotify.com/v1/me/player', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      contentType: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch current track')
  }

  const data = await response.json()
  return data
}
