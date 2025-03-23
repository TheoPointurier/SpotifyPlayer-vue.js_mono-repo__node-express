// src/services/authService.ts
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/get-token`, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Non authentifié. Veuillez vous reconnecter.');
      }
      throw new Error('Erreur lors de la récupération du token');
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    throw error;
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
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};

export const getProfile = async (): Promise<SpotifyProfile> => {
  try {
    const response = await fetch(`${BASE_URL}/api/spotify/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        method: 'GET',
        path: '/v1/me',
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Non authentifié. Veuillez vous reconnecter.');
      }
      const errorText = await response.text();
      throw new Error(`Erreur lors de la récupération du profil: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
};