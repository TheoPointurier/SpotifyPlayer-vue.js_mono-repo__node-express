import { Router } from 'express';
import { getCurrentTrack } from '../controllers/spotifyController.js';

const router = Router();

router.get('/current-track', getCurrentTrack);

export default router;