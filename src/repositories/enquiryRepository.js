import { ObjectId } from 'mongodb'
import { getEnquiriesCollection } from '../config/mongodb.js'
import {
  deleteLocalEnquiry,
  getLocalEnquiries,
  updateLocalEnquiry,
} from '../config/localEnquiryStore.js'

const mapEnquiryDocument = (document) => ({
  id: document._id instanceof ObjectId ? document._id.toHexString() : String(document._id),
  name: document.name,
  email: document.email,
  phone: document.phone,
  query: document.query || document.message,
  message: document.message || document.query,
  status: document.status || 'new',
  createdAt: document.createdAt,
  updatedAt: document.updatedAt || document.createdAt,
})

export const listEnquiries = async () => {
  try {
    const collection = await getEnquiriesCollection()
    const enquiries = await collection.find({}, { sort: { createdAt: -1 } }).toArray()

    return enquiries.map(mapEnquiryDocument)
  } catch (error) {
    const enquiries = await getLocalEnquiries()
    return enquiries
      .map((enquiry) => ({
        ...enquiry,
        id: enquiry.id || enquiry._id || '',
        query: enquiry.query || enquiry.message,
        status: enquiry.status || 'new',
        updatedAt: enquiry.updatedAt || enquiry.createdAt,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}
export const createEnquiry = async (enquiry) => {
  const collection = await getEnquiriesCollection()
  const result = await collection.insertOne(enquiry)

  return {
    id: result.insertedId.toHexString(),
    ...enquiry,
  }
}

export const updateEnquiryById = async (id, patch) => {
  try {
    const collection = await getEnquiriesCollection()
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id }
    const result = await collection.findOneAndUpdate(
      query,
      { $set: { ...patch, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' },
    )

    if (!result) {
      return null
    }

    const updated = result.value || result
    return updated ? mapEnquiryDocument(updated) : null
  } catch (error) {
    const updated = await updateLocalEnquiry(id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    })

    return updated
  }
}

export const deleteEnquiryById = async (id) => {
  try {
    const collection = await getEnquiriesCollection()
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id }
    const result = await collection.deleteOne(query)
    return result.deletedCount > 0
  } catch (error) {
    return deleteLocalEnquiry(id)
  }
}

export const getEnquiryById = async (id) => {
  try {
    const collection = await getEnquiriesCollection()
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id }
    const enquiry = await collection.findOne(query)

    return enquiry ? mapEnquiryDocument(enquiry) : null
  } catch (error) {
    const enquiries = await getLocalEnquiries()
    const enquiry = enquiries.find((record) => String(record.id || record._id) === String(id))

    return enquiry
      ? {
          ...enquiry,
          id: enquiry.id || enquiry._id || '',
          status: enquiry.status || 'new',
          updatedAt: enquiry.updatedAt || enquiry.createdAt,
        }
      : null
  }
}

