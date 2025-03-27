// src/controllers/authController.ts
import type { Request, Response } from 'express'

const FRONTEND_URL =
  process.env.FRONTEND_URL || 'https://theopointurier.com/spotify-app'

export function login(
  req: Request,
  res: Response<
    { error: string } | { access_token: string; refresh_token: string }
  >,
) {
  if (req.session?.accessToken) {
    return res.redirect(FRONTEND_URL)
  }

  const scope = [
    'streaming user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
  ].join(' ')
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}&scope=${encodeURIComponent(scope)}`
  res.redirect(authUrl)
}

export async function callback(
  req: Request<{ code: string }>,
  res: Response<
    { error: string } | { access_token: string; refresh_token: string }
  >,
) {
  const error = req.query.error as string
  const code = req.query.code as string

  console.log('Paramètres de la requête /auth/callback:', req.query)

  if (error) {
    console.log('Erreur Spotify:', error)
    return res.redirect('https://theopointurier.com/spotify-app/login')
  }

  if (!code) {
    console.error('Code manquant dans le callback Spotify')
    return res.redirect('https://theopointurier.com/spotify-app/login')
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI as string,
      }).toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log(
        `Erreur lors de la récupération du token: ${response.status} - ${errorText}`,
      )
      console.log('Session après stockage dans /auth/callback:', req.session)
    }

    const data = await response.json()
    console.log('Réponse de Spotify (callback):', data)

    if (!data.refresh_token) {
      console.error('Aucun refresh_token renvoyé par Spotify')
      res.status(500).json({ error: 'Aucun refresh_token renvoyé par Spotify' })
      return
    }

    // if (req.session) {
    req.session.accessToken = data.access_token
    req.session.refreshToken = data.refresh_token
    req.session.expiresIn = data.expires_in
    req.session.expiresAt = Date.now() + data.expires_in * 1000
    // }
    console.log('Session après stockage dans /auth/callback:', req.session)

    res.cookie('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: data.expires_in * 1000,
    })

    res.on('finish', () => {
      console.log('En-têtes envoyés dans /auth/callback:', res.getHeaders())
    })

    res.redirect(FRONTEND_URL)
    // res.json({ access_token: data.access_token, refresh_token: data.refresh_token });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de l’authentification' })
  }
}

export async function getToken(req: Request, res: Response<{ access_token: string } | { error: string }>) {
  console.log('getToken');
  console.log('Cookies:', req.cookies); // Vérifie si le cookie est bien envoyé
  console.log('Session:', req.session);

  // Essaie de lire l'access_token depuis le cookie ou la session
  let accessToken = req.cookies?.access_token || req.session?.accessToken;
  const expiresAt = req.session?.expiresAt;

  // Vérifier si le token est présent
  if (!accessToken) {
    res.status(401).json({ error: 'Non Authentifié' });
    return;
  }

  // Vérifier si le token est expiré (si tu veux garder cette logique)
  if (expiresAt && Date.now() > expiresAt) {
    const refreshToken = req.session?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ error: 'Non Authentifié' });
      return; 
    }

    // Rafraîchir le token
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du rafraîchissement du token');
      }
      const data = await response.json();

      // Met à jour la session
      req.session.accessToken = data.access_token;
      req.session.expiresIn = data.expires_in;
      req.session.expiresAt = Date.now() + data.expires_in * 1000;

      // Met à jour le cookie
      res.cookie('access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: data.expires_in * 1000,
      });

      accessToken = data.access_token;
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors du rafraîchissement du token' });
      return; 
    }
  }

  res.json({ access_token: accessToken });
}

export async function refresh(
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  req: Request<{}, {}, { refresh_token: string }>,
  res: Response<
    { access_token: string; expires_in: number } | { error: string }
  >,
) {
  const refreshToken = req.session?.refreshToken || req.body.refresh_token
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token manquant' })
    return
  }
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    })

    if (!response.ok)
      throw new Error('Erreur lors du rafraîchissement du token')
    const data = await response.json()

    if (req.session) {
      req.session.accessToken = data.access_token
      req.session.expiresIn = data.expires_in
    }

    res.cookie('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: data.expires_in * 1000,
    })

    res.json({ access_token: data.access_token, expires_in: data.expires_in })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors du rafraîchissement' })
  }
}

export function logout(
  req: Request,
  res: Response<{ message: string } | { error: string }>,
) {
  res.cookie('access_token', '', { expires: new Date(0) })
  req.session?.destroy((err: Error | null) => {
    if (err) {
      console.error('Erreur lors de la destruction de la session', err)
      res.status(500).json({ error: 'Erreur lors de la déconnexion' })
      return
    }
    res.json({ message: 'Déconnecté' })
  })
}
