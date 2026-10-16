import cors from 'cors'
import express from 'express'
import apiRoutes from './routes/apiRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', apiRoutes)
app.use('/api/admin', adminRoutes)

app.use((error, req, res, next) => {
  const isMongoAuthenticationError =
    error?.code === 18 || /bad auth|authentication failed/i.test(error?.message || '')

  if (isMongoAuthenticationError) {
    res.status(503).json({
      success: false,
      error: 'MongoDB authentication failed',
      hint: 'Verify the MongoDB database username and password in backend/.env, then restart the backend.',
    })
    return
  }

  const isMongoConnectionError =
    error?.name === 'MongoServerSelectionError' ||
    error?.name === 'MongoNetworkError' ||
    error?.name === 'MongoTimeoutError' ||
    /ssl|tls|handshake|server selection/i.test(error?.message || '')

  if (isMongoConnectionError) {
    res.status(503).json({
      success: false,
      error: 'Database connection failed',
      hint: 'Check your Atlas IP Access List, database username/password, and network connectivity.',
      detail: error?.message || 'MongoDB connection error',
    })
    return
  }

  if (error?.message === 'MONGODB_URI is not set') {
    res.status(500).json({
      success: false,
      error: 'MONGODB_URI is not set',
      hint: 'Add your MongoDB Atlas connection string to the MONGODB_URI environment variable.',
    })
    return
  }

  res.status(500).json({
    success: false,
    error: error?.message || 'Internal server error',
  })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

export default app
