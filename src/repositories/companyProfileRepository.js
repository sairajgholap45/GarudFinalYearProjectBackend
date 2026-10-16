import { getCompanyProfileCollection } from '../config/mongodb.js'

const DEFAULT_COMPANY_PROFILE = {
  companyName: 'Garud Exports & Services',
  focus: [
    'Fruits & Vegetables',
    'Grocery Products',
    'Indian Spices',
    'Dry Fruits & Nuts',
    'Handicrafts',
    'Copper Articles',
  ],
  supportEmail: 'info@garudexportsandservices.com',
}

/**
 * Get company profile from database
 * Returns default if not found
 */
export const getCompanyProfile = async () => {
  try {
    const collection = await getCompanyProfileCollection()
    let profile = await collection.findOne({ _id: 'default' })

    if (!profile) {
      // Initialize with default if not exists
      profile = { _id: 'default', ...DEFAULT_COMPANY_PROFILE, createdAt: new Date(), updatedAt: new Date() }
      await collection.insertOne(profile)
    }

    return profile
  } catch (error) {
    console.error('[CompanyProfileRepository] Get error:', error)
    throw error
  }
}

/**
 * Update company profile in database
 */
export const updateCompanyProfile = async (data) => {
  try {
    const collection = await getCompanyProfileCollection()

    const updateData = {
      companyName: data.companyName || DEFAULT_COMPANY_PROFILE.companyName,
      focus: Array.isArray(data.focus) ? data.focus : DEFAULT_COMPANY_PROFILE.focus,
      supportEmail: data.supportEmail || DEFAULT_COMPANY_PROFILE.supportEmail,
      updatedAt: new Date(),
    }

    const result = await collection.findOneAndUpdate(
      { _id: 'default' },
      { $set: updateData },
      { upsert: true, returnDocument: 'after' }
    )

    return result.value || { _id: 'default', ...updateData }
  } catch (error) {
    console.error('[CompanyProfileRepository] Update error:', error)
    throw error
  }
}

/**
 * Get company profile as it was when created
 */
export const getCompanyProfileCreatedAt = async () => {
  try {
    const collection = await getCompanyProfileCollection()
    const profile = await collection.findOne({ _id: 'default' })
    return profile?.createdAt || new Date()
  } catch (error) {
    return new Date()
  }
}
