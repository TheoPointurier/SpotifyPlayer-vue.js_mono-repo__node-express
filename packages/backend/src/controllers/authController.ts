import { Request, Response } from 'express';
import spotifyApi from '../config/spotifyConfig.js';

export const login = (req: Request, res: Response) => {
  const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state');
  res.redirect(authorizeURL);
};

export const callback = async (req: Request, res: Response) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code as string);
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    res.json({ access_token, refresh_token });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};