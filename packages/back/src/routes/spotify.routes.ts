import express from 'express';
import spotifyController from '../controllers/spotify.controller.js';

const router = express.Router();

router.get('/login', spotifyController.login)
router.get('/callback', spotifyController.callback)
router.get('/playlist/:id', spotifyController.getPlaylist)

export default router;