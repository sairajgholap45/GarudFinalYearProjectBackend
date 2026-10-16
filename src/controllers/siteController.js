import {
  getCompanyProfile as getCompanyProfileDB,
  updateCompanyProfile as updateCompanyProfileDB,
} from '../repositories/companyProfileRepository.js'
import {
  getSiteContent as getSiteContentDB,
  updateSiteContent as updateSiteContentDB,
} from '../repositories/siteContentRepository.js'

export const healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
  })
}

export const getCompanyProfile = async (req, res, next) => {
  try {
    const companyProfile = await getCompanyProfileDB()
    res.json(companyProfile)
  } catch (error) {
    next(error)
  }
}

export const getSiteContent = async (req, res, next) => {
  try {
    const siteContent = await getSiteContentDB()
    res.json(siteContent)
  } catch (error) {
    next(error)
  }
}

export const updateCompanyProfile = async (req, res, next) => {
  try {
    const updatedCompanyProfile = await updateCompanyProfileDB(req.body || {})
    console.log('[content] Company profile saved', {
      companyName: updatedCompanyProfile.companyName,
      supportEmail: updatedCompanyProfile.supportEmail,
    })

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      companyProfile: updatedCompanyProfile,
    })
  } catch (error) {
    next(error)
  }
}

export const updateSiteContent = async (req, res, next) => {
  try {
    const updatedSiteContent = await updateSiteContentDB(req.body || {})
    console.log('[content] Site content saved', {
      brandName: updatedSiteContent.brandName,
      productCount: Array.isArray(updatedSiteContent.products) ? updatedSiteContent.products.length : 0,
      featureCount: Array.isArray(updatedSiteContent.features) ? updatedSiteContent.features.length : 0,
    })

    res.json({
      success: true,
      message: 'Site content updated successfully',
      siteContent: updatedSiteContent,
    })
  } catch (error) {
    next(error)
  }
}
