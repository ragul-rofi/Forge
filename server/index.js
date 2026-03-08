import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import emailRouter from './routes/email.js'
import exportRouter from './routes/export.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api', emailRouter)
app.use('/api', exportRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`FORGE server running on port ${PORT}`)
})
