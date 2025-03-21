const BASE_URL = import.meta.env.VITE_BASE_URL;

export const login = () => {
  window.location.href = `${BASE_URL}/auth/login`;
};

export const getCurrentTrack = async (token: string) => {
  const response = await fetch(`${BASE_URL}/spotify/current-track`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch current track');
  }

  const data = await response.json();
  return data;
};