// types/spotify-sdk.d.ts

// Déclaration du namespace Spotify pour le SDK
declare namespace Spotify {
  interface PlaybackState {
    track_window: {
      current_track: {
        name: string;
        artists: { name: string }[];
        album: { name: string; images: { url: string }[] };
        uri: string;
        duration_ms: number;
      };
    };
    position: number;
    paused: boolean;
    shuffle: boolean;
  }

  class Player {
    constructor(options: {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
      volume?: number;
    });

    connect(): Promise<boolean>;
    nextTrack(): Promise<void>;
    getCurrentState(): Promise<PlaybackState | null>;
    previousTrack(): Promise<void>;
    toggleShuffle(state: boolean): Promise<void>;
    disconnect(): void;
    addListener(event: 'ready', callback: (data: { device_id: string }) => void): void;
    addListener(event: 'not_ready', callback: (data: { device_id: string }) => void): void;
    addListener(event: 'player_state_changed', callback: (state: PlaybackState | null) => void): void;
    pause(): Promise<void>;
    resume(): Promise<void>;
  }
}

// Étendre l'interface Window pour inclure les propriétés personnalisées
interface Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  spotifySDKReady: boolean;
  deviceId?: string;
}

interface TrackList {
  items: SpotifyPlaylistTrack[];
  total: number;
}