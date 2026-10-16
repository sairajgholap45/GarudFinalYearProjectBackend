import { MongoClient } from 'mongodb'

const databaseName = process.env.MONGODB_DB_NAME || 'garud_exports_services'
const connectionTimeoutMs = Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 4000)

let clientPromise
let client
let hasLoggedConnection = false

export const connectMongo = async () => {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set')
  }

  if (!clientPromise) {
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    })
    clientPromise = client.connect().catch((error) => {
      clientPromise = null
      client = null
      throw error
    })
  }

  let timerId

  try {
    await Promise.race([
      clientPromise,
      new Promise((_, reject) => {
        timerId = setTimeout(() => {
          reject(new Error(`MongoDB connection timed out after ${connectionTimeoutMs}ms`))
        }, connectionTimeoutMs)
      }),
    ])
  } catch (error) {
    clientPromise = null

    if (client) {
      client.close().catch(() => {})
      client = null
    }

    throw error
  } finally {
    clearTimeout(timerId)
  }

  const db = client.db(databaseName)

  if (!hasLoggedConnection) {
    hasLoggedConnection = true
    console.log(`MongoDB connected: ${databaseName}`)
  }

  return db
}

export const getEnquiriesCollection = async () => {
  const db = await connectMongo()
  return db.collection('enquiries')
}

export const getCompanyProfileCollection = async () => {
  const db = await connectMongo()
  return db.collection('company_profile')
}

export const getSiteContentCollection = async () => {
  const db = await connectMongo()
  return db.collection('site_content')
}

export const getAdminSettingsCollection = async () => {
  const db = await connectMongo()
  return db.collection('admin_settings')
}
