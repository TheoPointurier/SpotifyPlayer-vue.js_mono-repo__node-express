const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI
} = process.env

const scopes = [
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  // vous pouvez ajouter d'autres scopes si besoin
]

const SpotifyService = {
  getAuthUrl: () => {
    const url = new URL('https://accounts.spotify.com/authorize')
    if (!SPOTIFY_CLIENT_ID) {
      throw new Error('SPOTIFY_CLIENT_ID is not defined')
    }
    url.searchParams.set('client_id', SPOTIFY_CLIENT_ID)
    url.searchParams.set('response_type', 'code')
    if (!SPOTIFY_REDIRECT_URI) {
      throw new Error('SPOTIFY_REDIRECT_URI is not defined')
    }
    url.searchParams.set('redirect_uri', SPOTIFY_REDIRECT_URI)
    url.searchParams.set('scope', scopes.join(' '))
    return url.toString()
  },

  fetchTokens: async (code) => {
    const url = 'https://accounts.spotify.com/api/token'
    const params = new URLSearchParams()
    params.append('grant_type', 'authorization_code')
    params.append('code', code)
    if (!SPOTIFY_REDIRECT_URI) {
      throw new Error('SPOTIFY_REDIRECT_URI is not defined')
    }
    params.append('redirect_uri', SPOTIFY_REDIRECT_URI)

    const authHeader = Buffer
      .from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
      .toString('base64')

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      },
      body: params
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch tokens: ${res.statusText}`)
    }

    return res.json() // { access_token, refresh_token, expires_in, ... }
  },

  getPlaylistData: async (playlistId, accessToken) => {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch playlist data: ${res.statusText}`)
    }

    return res.json()
  }
}

export default SpotifyService;