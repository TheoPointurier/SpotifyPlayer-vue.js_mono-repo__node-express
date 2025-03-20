import express from 'express'
// import cors from 'cors'
import dotenv from 'dotenv'
import spotifyRoutes from './routes/spotify.routes.js'

dotenv.config()

const app = express()
// app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => {
  res.send('API Spotify is comming soon')
}
)
app.use('/api/spotify', spotifyRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

