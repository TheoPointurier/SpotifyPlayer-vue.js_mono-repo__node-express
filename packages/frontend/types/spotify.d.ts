// types/spotify.ts
interface SpotifyProfile {
  display_name: string;
  id: string;
  email?: string;
  images?: { url: string }[];
}

interface SpotifyTrack {
  item: {
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
    uri: string;
    duration_ms: number;
  };
  progress_ms: number;
  is_playing: boolean;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  images: { url: string }[];
  tracks: {
    href: string;
    total: number;
  };
}

interface SpotifyPlaylistTrack {
  track: {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
    uri: string;
    duration_ms: number;
  };
}