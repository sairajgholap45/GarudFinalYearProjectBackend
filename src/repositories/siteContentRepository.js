import { getSiteContentCollection } from '../config/mongodb.js'

const DEFAULT_SITE_CONTENT = {
  brandName: 'Garud Exports & Services',
  tagline: "Delivering India's Quality to the World",
  focusAreas: [
    'Fruits & Vegetables',
    'Grocery Products',
    'Indian Spices',
    'Dry Fruits & Nuts',
    'Namkeen & Traditional Snacks',
    'Handicrafts',
    'Imitation Jewellery',
    'Copper Articles',
    'Furniture & Home Decor',
  ],
  contact: {
    phone: '+91-8856851907',
    email: 'info@garudexportsandservices.com',
    address: '102, Sadguru Krupa Sadan, near Shubh Ayush School, Tal - Murbad 421401, District - Thane',
  },
  trustPoints: [
    'Premium, carefully sourced products',
    'Quality, transparency, and trust',
    'Reliable packaging and timely delivery',
  ],
  products: [],
  features: [],
}

/**
 * Get site content from database
 * Returns default if not found
 */
export const getSiteContent = async () => {
  try {
    const collection = await getSiteContentCollection()
    let content = await collection.findOne({ _id: 'default' })

    if (!content) {
      // Initialize with default if not exists
      content = { _id: 'default', ...DEFAULT_SITE_CONTENT, createdAt: new Date(), updatedAt: new Date() }
      await collection.insertOne(content)
    }

    return content
  } catch (error) {
    console.error('[SiteContentRepository] Get error:', error)
    throw error
  }
}

/**
 * Update site content in database
 */
export const updateSiteContent = async (data) => {
  try {
    const collection = await getSiteContentCollection()

    const updateData = {
      brandName: data.brandName || DEFAULT_SITE_CONTENT.brandName,
      tagline: data.tagline || DEFAULT_SITE_CONTENT.tagline,
      focusAreas: Array.isArray(data.focusAreas) ? data.focusAreas : DEFAULT_SITE_CONTENT.focusAreas,
      contact: data.contact || DEFAULT_SITE_CONTENT.contact,
      trustPoints: Array.isArray(data.trustPoints) ? data.trustPoints : DEFAULT_SITE_CONTENT.trustPoints,
      products: Array.isArray(data.products) ? data.products : DEFAULT_SITE_CONTENT.products,
      features: Array.isArray(data.features) ? data.features : DEFAULT_SITE_CONTENT.features,
      updatedAt: new Date(),
    }

    const result = await collection.findOneAndUpdate(
      { _id: 'default' },
      { $set: updateData },
      { upsert: true, returnDocument: 'after' }
    )

    return result.value || { _id: 'default', ...updateData }
  } catch (error) {
    console.error('[SiteContentRepository] Update error:', error)
    throw error
  }
}

/**
 * Partially update site content fields
 */
export const patchSiteContent = async (data) => {
  try {
    const collection = await getSiteContentCollection()

    // Only update provided fields
    const updateData = {}

    if (data.brandName) updateData.brandName = data.brandName
    if (data.tagline) updateData.tagline = data.tagline
    if (Array.isArray(data.focusAreas)) updateData.focusAreas = data.focusAreas
    if (data.contact) updateData.contact = data.contact
    if (Array.isArray(data.trustPoints)) updateData.trustPoints = data.trustPoints
    if (Array.isArray(data.products)) updateData.products = data.products
    if (Array.isArray(data.features)) updateData.features = data.features

    updateData.updatedAt = new Date()

    const result = await collection.findOneAndUpdate(
      { _id: 'default' },
      { $set: updateData },
      { upsert: true, returnDocument: 'after' }
    )

    return result.value || { _id: 'default', ...DEFAULT_SITE_CONTENT, ...updateData }
  } catch (error) {
    console.error('[SiteContentRepository] Patch error:', error)
    throw error
  }
}

/**
 * Add product to site content
 */
export const addProduct = async (product) => {
  try {
    const collection = await getSiteContentCollection()

    const result = await collection.findOneAndUpdate(
      { _id: 'default' },
      {
        $push: { products: product },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    )

    return result.value || { _id: 'default', ...DEFAULT_SITE_CONTENT }
  } catch (error) {
    console.error('[SiteContentRepository] Add product error:', error)
    throw error
  }
}

/**
 * Remove product from site content
 */
export const removeProduct = async (productId) => {
  try {
    const collection = await getSiteContentCollection()

    const result = await collection.findOneAndUpdate(
      { _id: 'default' },
      {
        $pull: { products: { id: productId } },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    )

    return result.value || { _id: 'default', ...DEFAULT_SITE_CONTENT }
  } catch (error) {
    console.error('[SiteContentRepository] Remove product error:', error)
    throw error
  }
}

/**
 * Get site content creation date
 */
export const getSiteContentCreatedAt = async () => {
  try {
    const collection = await getSiteContentCollection()
    const content = await collection.findOne({ _id: 'default' })
    return content?.createdAt || new Date()
  } catch (error) {
    return new Date()
  }
}
