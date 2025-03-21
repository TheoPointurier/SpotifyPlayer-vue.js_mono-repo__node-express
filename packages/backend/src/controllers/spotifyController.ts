import { Request, Response } from 'express';
import spotifyApi from '../config/spotifyConfig.js';

export const getCurrentTrack = async (req: Request, res: Response) => {
  try {
    const data = await spotifyApi.getMyCurrentPlayingTrack();
    res.json(data.body);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch track' });
  }
};