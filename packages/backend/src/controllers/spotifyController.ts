// src/controllers/spotifyController.ts
import type { Request, Response } from 'express';

export async function getCurrentTrack(req: Request, res: Response) {
  const accessToken = req.session?.accessToken || req.cookies.access_token;
  if (!accessToken) {
    res.status(401).json({ error: 'Non Authentifié' });
    return;
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch track');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch track' });
  }
};

export function test(req: Request, res: Response) {
  res.json({ message: 'Backend fonctionne !' });
};