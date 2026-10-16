import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const enquiriesFilePath = path.resolve(currentDir, '../../data/enquiries.json')

const readJsonFile = async () => {
  try {
    const fileContents = await fs.readFile(enquiriesFilePath, 'utf8')
    const parsed = JSON.parse(fileContents)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return []
    }

    throw error
  }
}

const writeJsonFile = async (records) => {
  await fs.mkdir(path.dirname(enquiriesFilePath), { recursive: true })
  await fs.writeFile(enquiriesFilePath, JSON.stringify(records, null, 2), 'utf8')
}

export const saveEnquiryLocally = async (enquiry) => {
  const enquiries = await readJsonFile()
  enquiries.push(enquiry)
  await writeJsonFile(enquiries)

  return enquiry
}

export const getLocalEnquiries = async () => readJsonFile()

export const updateLocalEnquiry = async (id, patch) => {
  const enquiries = await readJsonFile()
  const index = enquiries.findIndex((enquiry) => String(enquiry.id || enquiry._id) === String(id))

  if (index === -1) {
    return null
  }

  enquiries[index] = {
    ...enquiries[index],
    ...patch,
  }

  await writeJsonFile(enquiries)
  return enquiries[index]
}

export const deleteLocalEnquiry = async (id) => {
  const enquiries = await readJsonFile()
  const nextEnquiries = enquiries.filter((enquiry) => String(enquiry.id || enquiry._id) !== String(id))

  if (nextEnquiries.length === enquiries.length) {
    return false
  }

  await writeJsonFile(nextEnquiries)
  return true
}
