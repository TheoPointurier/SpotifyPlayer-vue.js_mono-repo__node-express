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
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'ton_secret_pour_les_sessions',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Routes
app.use('/api', spotifyRouter);
app.use('/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});