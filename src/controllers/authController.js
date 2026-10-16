import { verifyAdminCredentials } from '../config/adminAuthStore.js'

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {}

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'email and password are required',
      })
      return
    }

    const isValid = await verifyAdminCredentials(email, password)

    if (!isValid) {
      console.log(`[admin-auth] Rejected login for ${String(email).trim().toLowerCase()}`)
      res.status(401).json({
        success: false,
        error: 'Invalid admin credentials',
      })
      return
    }

    console.log(`[admin-auth] Accepted login for ${String(email).trim().toLowerCase()}`)
    res.json({
      success: true,
      message: 'Login successful',
      admin: {
        email: String(email).trim().toLowerCase(),
      },
    })
  } catch (error) {
    next(error)
  }
}
