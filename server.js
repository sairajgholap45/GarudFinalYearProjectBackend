import './src/config/loadEnv.js'
import app from './src/app.js'
import { connectMongo } from './src/config/mongodb.js'
import { seedAdminAccount } from './src/config/adminAuthStore.js'
import { initializeDatabase } from './src/config/dbInitializer.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})

connectMongo()
  .then(() => {
    console.log('MongoDB ready')
    return seedAdminAccount()
  })
  .then(() => {
    return initializeDatabase()
  })
  .catch((error) => {
    console.error(`MongoDB connection failed: ${error.message}`)
  })
