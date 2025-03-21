// types/spotify.ts
export interface SpotifyTrack {
  item: {
    name: string;
    artists: { name: string }[];
    album: { name: string };
    // Ajoute d'autres propriétés si nécessaire
  };
  is_playing: boolean;
  progress_ms: number;
  // Ajoute d'autres propriétés si nécessaire
}

export interface SpotifyProfile {
  display_name: string;
  email: string;
  id: string;
  images: { url: string }[];
  // Ajoute d'autres propriétés si nécessaire
}