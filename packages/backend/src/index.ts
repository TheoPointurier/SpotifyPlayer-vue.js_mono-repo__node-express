// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import  spotifyRouter  from './routes/spotifyRoutes.js';
import  authRouter  from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: ['https://theopointurier.com','https://theopointurier.com/spotify-app'],
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ton_secret_pour_les_sessions',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);
console.log('Configuration de express-session:', app.get('session'));
app.use(cors(corsOptions));

// Routes
app.use('/api', spotifyRouter);
app.use('/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});