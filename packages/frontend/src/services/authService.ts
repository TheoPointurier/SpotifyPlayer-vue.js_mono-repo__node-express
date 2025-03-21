// src/services/authService.ts
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/get-token`, {
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du token', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la déconnexion');
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion', error);
    throw error;
  }
};

export const getProfile = async (token: string): Promise<SpotifyProfile> => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du profil');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};