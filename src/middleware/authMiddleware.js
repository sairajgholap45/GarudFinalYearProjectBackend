import { verifyAdminCredentials } from '../config/adminAuthStore.js'

/**
 * Middleware to verify admin authentication via email and password in headers
 * Usage: router.get('/admin/protected-route', authMiddleware, handler)
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const email = req.headers['x-admin-email']
    const password = req.headers['x-admin-password']

    if (!email || !password) {
      res.status(401).json({
        success: false,
        error: 'Admin authentication required',
        message: 'Please provide x-admin-email and x-admin-password headers',
      })
      return
    }

    const isValid = await verifyAdminCredentials(email, password)

    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid admin credentials',
      })
      return
    }

    // Attach admin info to request
    req.admin = {
      email: String(email).trim().toLowerCase(),
      authenticated: true,
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Token-based authentication middleware (optional for future JWT implementation)
 */
export const requireAdmin = (req, res, next) => {
  if (!req.admin || !req.admin.authenticated) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized access',
    })
    return
  }
  next()
}
