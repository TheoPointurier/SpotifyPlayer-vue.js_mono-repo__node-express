// src/routes/spotifyRoutes.ts
import { Router } from 'express';
import { getCurrentTrack, test } from '../controllers/spotifyController.js';

const spotifyRouter = Router();

spotifyRouter.get('/current-track', getCurrentTrack);
spotifyRouter.get('/test', test);

export default spotifyRouter ;