//import { connectMongo, getCompanyProfileCollection, getSiteContentCollection } from './config/mongodb.js'
import { connectMongo, getCompanyProfileCollection, getSiteContentCollection } from './mongodb.js'

const DEFAULT_COMPANY_PROFILE = {
  _id: 'default',
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
  createdAt: new Date(),
  updatedAt: new Date(),
}

const DEFAULT_SITE_CONTENT = {
  _id: 'default',
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
  products: [
    {
      id: 'fruits-vegetables',
      title: 'Fruits & Vegetables',
      description: 'Farm-fresh produce carefully sourced and packed to maintain natural freshness and quality.',
      image: '/images/fruits-vegetables.svg',
    },
    {
      id: 'grocery',
      title: 'Grocery Products',
      description: 'Essential Indian grocery items hygienically processed for consistent quality, safety, and shelf life.',
      image: '/images/grocery.svg',
    },
    {
      id: 'spices',
      title: 'Indian Spices',
      description: 'Authentic Indian spices offering rich aroma, natural color, and bold flavor profiles.',
      image: '/images/spices.svg',
    },
    {
      id: 'dry-fruits',
      title: 'Dry Fruits & Nuts',
      description: 'Premium dry fruits and nuts selected for freshness, taste, nutrition, and purity.',
      image: '/images/dry-fruits.svg',
    },
    {
      id: 'namkeen',
      title: 'Namkeen & Traditional Snacks',
      description: 'Traditional Indian snacks prepared hygienically to preserve authentic taste and crunch.',
      image: '/images/namkeen.svg',
    },
    {
      id: 'handicrafts',
      title: 'Handicrafts',
      description: "Authentic handcrafted products reflecting India's rich cultural heritage, made by skilled artisans using traditional techniques.",
      image: '/images/handicrafts.svg',
    },
    {
      id: 'jewellery',
      title: 'Imitation Jewellery',
      description: 'Stylish and elegant imitation jewellery designed to match global fashion trends while maintaining superior finish and durability.',
      image: '/images/jewellery.svg',
    },
    {
      id: 'copper',
      title: 'Copper Articles',
      description: 'High-quality copper products crafted with precision, suitable for daily use, gifting, and decorative purposes.',
      image: '/images/copper-articles.svg',
    },
    {
      id: 'furniture',
      title: 'Furniture & Home Decor',
      description: 'Beautifully designed furniture and home decor items that combine craftsmanship, functionality, and timeless aesthetics.',
      image: '/images/furniture.svg',
    },
  ],
  features: [
    {
      id: 'quality-standards',
      title: 'Uncompromising Quality Standards',
      description: 'Strict quality control at every stage from sourcing and handling to packaging and dispatch.',
    },
    {
      id: 'premium-products',
      title: 'Premium & Verified Products',
      description: 'Carefully sourced food products and lifestyle goods from verified farmers, artisans, and manufacturers.',
    },
    {
      id: 'supply-network',
      title: 'Reliable Global Supply Network',
      description: 'Consistent supply and timely delivery to international markets through dependable logistics.',
    },
    {
      id: 'customer-centric',
      title: 'Customer-Centric Approach',
      description: 'Clear communication and customized solutions tailored to buyer requirements.',
    },
    {
      id: 'ethical-trade',
      title: 'Ethical & Responsible Trade',
      description: 'We value fair trade, responsible sourcing, and long-term business conduct.',
    },
    {
      id: 'transparent-ops',
      title: 'Transparent Business Operations',
      description: 'Honest communication, clear documentation, and traceable processes for smooth trade.',
    },
    {
      id: 'industry-exp',
      title: 'Industry Experience & Commitment',
      description: 'Export knowledge and a commitment to excellence that support lasting partnerships.',
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
}

/**
 * Initialize database with default data
 * Run this once to seed the database
 */
export const initializeDatabase = async () => {
  try {
    console.log('[Database] Initializing...')

    // Initialize Company Profile Collection
    const companyCollection = await getCompanyProfileCollection()
    const existingProfile = await companyCollection.findOne({ _id: 'default' })

    if (!existingProfile) {
      await companyCollection.insertOne(DEFAULT_COMPANY_PROFILE)
      console.log('[Database] ✓ Company profile created')
    } else {
      console.log('[Database] ✓ Company profile already exists')
    }

    // Initialize Site Content Collection
    const siteCollection = await getSiteContentCollection()
    const existingContent = await siteCollection.findOne({ _id: 'default' })

    if (!existingContent) {
      await siteCollection.insertOne(DEFAULT_SITE_CONTENT)
      console.log('[Database] ✓ Site content created')
    } else {
      console.log('[Database] ✓ Site content already exists')
    }

    // Create indexes for better performance
    await companyCollection.createIndex({ _id: 1 })
    await siteCollection.createIndex({ _id: 1 })

    console.log('[Database] Initialization complete!')
    return true
  } catch (error) {
    console.error('[Database] Initialization error:', error)
    throw error
  }
}

/**
 * Reset database to defaults
 * WARNING: This will overwrite existing data
 */
export const resetDatabase = async () => {
  try {
    console.log('[Database] Resetting to defaults...')

    const companyCollection = await getCompanyProfileCollection()
    const siteCollection = await getSiteContentCollection()

    await companyCollection.deleteOne({ _id: 'default' })
    await siteCollection.deleteOne({ _id: 'default' })

    const result = await initializeDatabase()
    console.log('[Database] Reset complete!')

    return result
  } catch (error) {
    console.error('[Database] Reset error:', error)
    throw error
  }
}

/**
 * Clear all admin data (careful!)
 */
export const clearAllAdminData = async () => {
  try {
    const companyCollection = await getCompanyProfileCollection()
    const siteCollection = await getSiteContentCollection()

    await companyCollection.deleteMany({})
    await siteCollection.deleteMany({})

    console.log('[Database] All admin data cleared!')
  } catch (error) {
    console.error('[Database] Clear error:', error)
    throw error
  }
}

/**
 * Get database status and statistics
 */
export const getDatabaseStats = async () => {
  try {
    const companyCollection = await getCompanyProfileCollection()
    const siteCollection = await getSiteContentCollection()

    const companyCount = await companyCollection.countDocuments()
    const siteCount = await siteCollection.countDocuments()

    return {
      status: 'connected',
      collections: {
        company_profile: companyCount,
        site_content: siteCount,
      },
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    }
  }
}
