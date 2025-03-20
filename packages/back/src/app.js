import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import spotifyRoutes from './routes/SpotifyRoutes.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/spotify', spotifyRoutes)

module.exports = app
