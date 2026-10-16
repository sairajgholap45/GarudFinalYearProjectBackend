import { promises as fs } from 'fs'
import path from 'path'
import { createHash, randomUUID } from 'node:crypto'
import { fileURLToPath } from 'url'
import { connectMongo } from './mongodb.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const adminAuthFilePath = path.resolve(currentDir, '../../data/admin-auth.json')
const adminCollectionName = 'admin_accounts'

const DEFAULT_ADMIN_EMAIL = 'sairajgholap45@gmail.com'
const DEFAULT_ADMIN_PASSWORD = 'saira888'

const hashPassword = (password) => createHash('sha256').update(password).digest('hex')

const defaultAdminAccount = {
  id: randomUUID(),
  email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
  passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const readLocalAccounts = async () => {
  try {
    const fileContents = await fs.readFile(adminAuthFilePath, 'utf8')
    const parsed = JSON.parse(fileContents)

    return Array.isArray(parsed) && parsed.length ? parsed : [defaultAdminAccount]
  } catch (error) {
    if (error?.code === 'ENOENT') {
      await fs.mkdir(path.dirname(adminAuthFilePath), { recursive: true })
      await fs.writeFile(adminAuthFilePath, JSON.stringify([defaultAdminAccount], null, 2), 'utf8')
      return [defaultAdminAccount]
    }

    throw error
  }
}

const writeLocalAccounts = async (accounts) => {
  await fs.mkdir(path.dirname(adminAuthFilePath), { recursive: true })
  await fs.writeFile(adminAuthFilePath, JSON.stringify(accounts, null, 2), 'utf8')
}

const ensureLocalSeed = async () => {
  const accounts = await readLocalAccounts()
  if (!accounts.some((account) => account.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase())) {
    accounts.push(defaultAdminAccount)
    await writeLocalAccounts(accounts)
    console.log(`[admin-auth] Seeded local admin account at ${adminAuthFilePath}`)
  }
}

export const seedAdminAccount = async () => {
  try {
    const db = await connectMongo()
    const collection = db.collection(adminCollectionName)
    const email = DEFAULT_ADMIN_EMAIL.toLowerCase()
    const now = new Date().toISOString()

    await collection.updateOne(
      { email },
      {
        $set: {
          email,
          passwordHash: defaultAdminAccount.passwordHash,
          updatedAt: now,
        },
        $setOnInsert: {
          id: defaultAdminAccount.id,
          createdAt: now,
        },
      },
      { upsert: true },
    )

    console.log(`[admin-auth] MongoDB admin account synced in ${adminCollectionName} for ${email}`)
  } catch (error) {
    await ensureLocalSeed()
    console.log(`[admin-auth] MongoDB unavailable, using local admin auth file: ${adminAuthFilePath}`)
  }
}

export const verifyAdminCredentials = async (email, password) => {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const passwordHash = hashPassword(String(password || '').trim())

  try {
    await seedAdminAccount()
    const db = await connectMongo()
    const collection = db.collection(adminCollectionName)
    const accounts = await collection.find({ email: normalizedEmail }).limit(1).toArray()

    if (!accounts.length) {
      console.log(`[admin-auth] Login attempt failed for unknown email ${normalizedEmail}`)
      return false
    }

    const account = accounts[0]
    const isValid = account.passwordHash === passwordHash
    console.log(`[admin-auth] Login attempt for ${normalizedEmail}: ${isValid ? 'success' : 'failed'}`)
    return isValid
  } catch (error) {
    await ensureLocalSeed()
    const accounts = await readLocalAccounts()
    const account = accounts.find((record) => record.email.toLowerCase() === normalizedEmail)

    if (!account) {
      console.log(`[admin-auth] Local login attempt failed for unknown email ${normalizedEmail}`)
      return false
    }

    const isValid = account.passwordHash === passwordHash
    console.log(`[admin-auth] Local login attempt for ${normalizedEmail}: ${isValid ? 'success' : 'failed'}`)
    return isValid
  }
}

export const getAdminProfile = async () => ({
  email: DEFAULT_ADMIN_EMAIL,
})
