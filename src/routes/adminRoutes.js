import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import {
  getAdminDashboard,
  getAllEnquiriesAdmin,
  exportEnquiries,
  getEnquiryAnalytics,
  bulkUpdateEnquiries,
  getActivityLog,
} from '../controllers/adminController.js'
import {
  getEnquiries,
  getEnquiry,
  updateEnquiry,
  removeEnquiry,
} from '../controllers/enquiryController.js'
import {
  getCompanyProfile,
  updateCompanyProfile,
  getSiteContent,
  updateSiteContent,
} from '../controllers/siteController.js'

const router = Router()

// All admin routes require authentication
router.use(authMiddleware)

// Dashboard
router.get('/dashboard', getAdminDashboard)

// Enquiries Management
router.get('/enquiries', getAllEnquiriesAdmin)
router.get('/enquiries/:id', getEnquiry)
router.patch('/enquiries/:id', updateEnquiry)
router.delete('/enquiries/:id', removeEnquiry)
router.post('/enquiries/bulk-update', bulkUpdateEnquiries)

// Export Data
router.get('/export/enquiries', exportEnquiries)

// Analytics
router.get('/analytics/enquiries', getEnquiryAnalytics)

// Activity Log
router.get('/activity-log', getActivityLog)

// Company Profile Management
router.get('/company', getCompanyProfile)
router.put('/company', updateCompanyProfile)

// Site Content Management
router.get('/content', getSiteContent)
router.put('/content', updateSiteContent)

export default router
