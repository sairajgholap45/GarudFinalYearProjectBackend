import { Router } from 'express'
import {
  getEnquiries,
  getEnquiry,
  removeEnquiry,
  submitEnquiry,
  updateEnquiry,
} from '../controllers/enquiryController.js'
import { loginAdmin } from '../controllers/authController.js'
import { getDatabaseStatus } from '../controllers/statusController.js'
import {
  getCompanyProfile,
  getSiteContent,
  healthCheck,
  updateCompanyProfile,
  updateSiteContent,
} from '../controllers/siteController.js'
import { getDebugData, watchDatabaseChanges } from '../controllers/debugController.js'

const router = Router()

router.get('/health', healthCheck)
router.get('/db-status', getDatabaseStatus)
router.post('/admin/login', loginAdmin)
router.get('/company', getCompanyProfile)
router.put('/company', updateCompanyProfile)
router.get('/site-content', getSiteContent)
router.put('/site-content', updateSiteContent)
router.get('/enquiries', getEnquiries)
router.get('/enquiries/:id', getEnquiry)
router.patch('/enquiries/:id', updateEnquiry)
router.delete('/enquiries/:id', removeEnquiry)
router.post('/enquiry', submitEnquiry)

// Debug endpoints (development only)
router.get('/debug/data', getDebugData)
router.get('/debug/watch', watchDatabaseChanges)

export default router
