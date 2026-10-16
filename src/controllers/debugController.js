import { getCompanyProfileCollection, getSiteContentCollection, getEnquiriesCollection } from '../config/mongodb.js'

/**
 * Debug endpoint to check database contents
 * Returns all collections data for verification
 */
export const getDebugData = async (req, res, next) => {
  try {
    const companyCollection = await getCompanyProfileCollection()
    const siteCollection = await getSiteContentCollection()
    const enquiriesCollection = await getEnquiriesCollection()

    const companyData = await companyCollection.findOne({ _id: 'default' })
    const siteData = await siteCollection.findOne({ _id: 'default' })
    const enquiriesCount = await enquiriesCollection.countDocuments()

    res.json({
      success: true,
      debug: {
        companyProfile: {
          saved: !!companyData,
          lastUpdated: companyData?.updatedAt || null,
          data: companyData || null,
        },
        siteContent: {
          saved: !!siteData,
          lastUpdated: siteData?.updatedAt || null,
          productCount: siteData?.products?.length || 0,
          featureCount: siteData?.features?.length || 0,
          data: siteData || null,
        },
        enquiries: {
          totalCount: enquiriesCount,
          status: 'OK',
        },
        timestamp: new Date(),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Debug endpoint to watch for changes in real-time
 */
export const watchDatabaseChanges = async (req, res, next) => {
  try {
    const collection = req.query.collection || 'company_profile'

    if (collection !== 'company_profile' && collection !== 'site_content') {
      res.status(400).json({
        success: false,
        error: "Invalid collection. Use 'company_profile' or 'site_content'",
      })
      return
    }

    const db = await require('../config/mongodb.js').connectMongo()
    const col = db.collection(collection)

    const data = await col.findOne({ _id: 'default' })

    res.json({
      success: true,
      collection,
      currentData: data,
      updatedAt: data?.updatedAt || 'Never updated',
      message: 'Refresh this page after making changes in admin panel',
    })
  } catch (error) {
    next(error)
  }
}
