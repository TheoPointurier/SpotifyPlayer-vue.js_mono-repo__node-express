import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get('/api/test', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Backend fonctionne !' });
});

app.get('/auth/login', (req: express.Request, res: express.Response) => {
  const scope = 'user-read-private user-read-email';
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}&scope=${scope}`;
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req: express.Request, res: express.Response) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: 'Code manquant' });
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
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI as string,
      }).toString(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération du token');
    const data = await response.json();

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
});

app.get('/api/get-token', (req: express.Request, res: express.Response) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    res.status(401).json({ error: 'Non Authentifié' });
    return;
  }
  res.json({ access_token: accessToken });
});

app.post('/auth/refresh', async (req: express.Request, res: express.Response) => {
  const refreshToken = req.body.refresh_token;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token manquant' });
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
    });

    if (!response.ok) throw new Error('Erreur lors du rafraîchissement du token');
    const data = await response.json();

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
});

app.get('/auth/logout', (req: express.Request, res: express.Response) => {
  // Supprime le cookie en le définissant avec une date d'expiration passée
  res.cookie('access_token', '', { expires: new Date(0) });
  // Redirige vers le frontend
  res.redirect(FRONTEND_URL);
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});