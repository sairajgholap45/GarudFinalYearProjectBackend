import {
  createEnquiry,
  deleteEnquiryById,
  getEnquiryById,
  listEnquiries,
  updateEnquiryById,
} from '../repositories/enquiryRepository.js'

const withTimeout = async (promise, timeoutMs, message) => {
  let timerId

  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timerId = setTimeout(() => reject(new Error(message)), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timerId)
  }
}

const validateEnquiry = ({ email, query, message }) => {
  const queryText = query || message

  if (!email || !queryText) {
    return 'email and query are required'
  }

  if (!email.includes('@')) {
    return 'email must be valid'
  }

  if (String(queryText).trim().length < 10) {
    return 'query should be at least 10 characters'
  }

  return null
}

export const submitEnquiry = async (req, res, next) => {
  try {
    const validationError = validateEnquiry(req.body)

    if (validationError) {
      res.status(400).json({
        success: false,
        error: validationError,
      })
      return
    }

    const enquiry = {
      email: req.body.email.trim(),
      query: (req.body.query || req.body.message).trim(),
      message: (req.body.query || req.body.message).trim(),
      name: req.body.name ? req.body.name.trim() : '',
      phone: req.body.phone ? req.body.phone.trim() : '',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const storedEnquiry = await withTimeout(
      createEnquiry(enquiry),
      7000,
      'Database request timed out. Check MongoDB Atlas access and credentials.',
    )

    console.log('[enquiry] Saved enquiry', {
      email: storedEnquiry.email,
      query: storedEnquiry.query || storedEnquiry.message,
      status: storedEnquiry.status,
      storageId: storedEnquiry.id,
    })

    res.status(201).json({
      success: true,
      message: 'Enquiry stored successfully',
      enquiry: storedEnquiry,
    })
  } catch (error) {
    next(error)
  }
}

export const getEnquiries = async (req, res, next) => {
  try {
    const enquiries = await withTimeout(
      listEnquiries(),
      7000,
      'Database request timed out. Check MongoDB Atlas access and credentials.',
    )

    res.json({
      count: enquiries.length,
      enquiries,
    })
  } catch (error) {
    next(error)
  }
}

export const getEnquiry = async (req, res, next) => {
  try {
    const enquiry = await withTimeout(
      getEnquiryById(req.params.id),
      7000,
      'Database request timed out. Check MongoDB Atlas access and credentials.',
    )

    if (!enquiry) {
      res.status(404).json({
        success: false,
        error: 'Enquiry not found',
      })
      return
    }

    res.json({ enquiry })
  } catch (error) {
    next(error)
  }
}

export const updateEnquiry = async (req, res, next) => {
  try {
    const patch = {}

    if (typeof req.body.status === 'string') {
      patch.status = req.body.status.trim().toLowerCase()
    }

    if (typeof req.body.notes === 'string') {
      patch.notes = req.body.notes.trim()
    }

    const updated = await withTimeout(
      updateEnquiryById(req.params.id, patch),
      7000,
      'Database request timed out. Check MongoDB Atlas access and credentials.',
    )

    if (!updated) {
      res.status(404).json({
        success: false,
        error: 'Enquiry not found',
      })
      return
    }

    res.json({
      success: true,
      message: 'Enquiry updated successfully',
      enquiry: updated,
    })
  } catch (error) {
    next(error)
  }
}

export const removeEnquiry = async (req, res, next) => {
  try {
    const deleted = await withTimeout(
      deleteEnquiryById(req.params.id),
      7000,
      'Database request timed out. Check MongoDB Atlas access and credentials.',
    )

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Enquiry not found',
      })
      return
    }

    res.json({
      success: true,
      message: 'Enquiry deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
