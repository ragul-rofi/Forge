import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import emailRouter from './routes/email.js'
import exportRouter from './routes/export.js'
import roadmapAIRouter from './routes/roadmap-ai.js'
import studentProgressRouter from './routes/student-progress.js'
import weeklyDigestRouter from './routes/weekly-digest.js'
import abandonmentRouter from './routes/abandonment.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174']

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH'],
}))
app.use(express.json())

// Routes
app.use('/api', emailRouter)
app.use('/api', exportRouter)
app.use('/api', roadmapAIRouter)
app.use('/api', studentProgressRouter)
app.use('/api', weeklyDigestRouter)
app.use('/api', abandonmentRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`FORGE server running on port ${PORT}`)
})
