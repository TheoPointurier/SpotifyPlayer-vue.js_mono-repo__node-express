import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://127.0.0.1:5173' }));
app.use(express.json());

app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Backend fonctionne !' });
});

app.get('/auth/login', (req: Request, res: Response) => {
  const scope = 'user-read-private user-read-email';
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}&scope=${scope}`;
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req: Request, res: Response) => {
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
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l’authentification' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});