import spotifyService from '../services/spotify.service.js'

const spotifyController = {
  login: (req, res) => {
    // Redirection vers la page d'autorisation Spotify
    const authUrl = spotifyService.getAuthUrl()
    res.redirect(authUrl)
  },

  callback: async (req, res) => {
    try {
      const { code } = req.query
      // Échanger le code contre un token
      const tokens = await spotifyService.fetchTokens(code)
      // Vous pouvez stocker tokens.access_token et tokens.refresh_token en session ou en DB
      return res.json({ success: true, tokens })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ success: false, error: error.message })
    }
  },

  getPlaylist: async (req, res) => {
    try {
      const playlistId = req.params.id
      // Ici, vous devriez récupérer un access_token valide (en session, DB, etc.)
      // exemple : const accessToken = ...
      const playlistData = await spotifyService.getPlaylistData(playlistId, "test_faux_tokens")
      return res.json(playlistData)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }
}

export default spotifyController;