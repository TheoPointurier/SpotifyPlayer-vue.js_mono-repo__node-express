// src/controllers/authController.ts
import type { Request, Response } from 'express';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const login = (
  req: Request,
  res: Response<{ error: string }>,
) => {
  if (req.session?.accessToken) {
    return res.redirect(FRONTEND_URL);
  }

  const scope = 'user-read-private user-read-email user-read-playback-state';
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}&scope=${scope}`;
  res.redirect(authUrl);
};

export const callback = async (
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  req: Request<{}, {}, {}, { code: string }>,
  res: Response<{ error: string }>,
) => {
  const code = req.query.code as string;
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
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération du token');
    const data = await response.json();

    if (req.session) {
      req.session.accessToken = data.access_token;
      req.session.refreshToken = data.refresh_token;
      req.session.expiresIn = data.expires_in;
    }

    res.cookie('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: data.expires_in * 1000,
    });

    res.redirect(FRONTEND_URL);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l’authentification' });
  }
};

export const getToken = (
  req: Request,
  res: Response<{ access_token: string } | { error: string }>,
) => {
  console.log('getToken');
  const accessToken = req.session?.accessToken || req.cookies.access_token;
  if (!accessToken) {
    res.status(401).json({ error: 'Non Authentifié' });
    return;
  }
  res.json({ access_token: accessToken });
};

export const refresh = async (
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  req: Request<{}, {}, { refresh_token: string }>,
  res: Response<{ access_token: string; expires_in: number } | { error: string }>,
) => {
  const refreshToken = req.session?.refreshToken || req.body.refresh_token;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token manquant' });
    return;
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
    });

    if (!response.ok) throw new Error('Erreur lors du rafraîchissement du token');
    const data = await response.json();

    if (req.session) {
      req.session.accessToken = data.access_token;
      req.session.expiresIn = data.expires_in;
    }

    res.cookie('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: data.expires_in * 1000,
    });

    res.json({ access_token: data.access_token, expires_in: data.expires_in });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du rafraîchissement' });
  }
};

export const logout = (
  req: Request,
  res: Response<{ message: string } | { error: string }>,
) => {
  res.cookie('access_token', '', { expires: new Date(0) });
  req.session?.destroy((err: Error | null) => {
    if (err) {
      console.error('Erreur lors de la destruction de la session', err);
      res.status(500).json({ error: 'Erreur lors de la déconnexion' });
      return;
    }
    res.json({ message: 'Déconnecté' });
  });
};