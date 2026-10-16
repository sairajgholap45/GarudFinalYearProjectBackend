import { connectMongo } from '../config/mongodb.js'
import { getLocalEnquiries } from '../config/localEnquiryStore.js'

export const getDatabaseStatus = async (req, res) => {
  try {
    const db = await connectMongo()
    const pingResult = await db.command({ ping: 1 })

    res.json({
      success: true,
      status: 'connected',
      database: db.databaseName,
      ping: pingResult,
      storage: 'mongodb',
    })
  } catch (error) {
    const localEnquiries = await getLocalEnquiries()

    res.status(503).json({
      success: false,
      status: 'degraded',
      storage: 'local-file',
      error: 'MongoDB connection failed; new enquiries cannot be saved to MongoDB',
      hint: 'Check Atlas Network Access, credentials, and the MONGODB_URI value in backend/.env.',
      detail: error?.message || 'Unknown database error',
      localEnquiryCount: localEnquiries.length,
    })
  }
}
