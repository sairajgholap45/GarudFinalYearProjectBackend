/**
 * Admin Utilities - Helper functions for admin operations
 */

/**
 * Format enquiry for display
 */
export const formatEnquiry = (enquiry) => {
  return {
    id: enquiry.id || enquiry._id,
    name: enquiry.name || 'Anonymous',
    email: enquiry.email,
    phone: enquiry.phone || 'N/A',
    message: enquiry.message || enquiry.query || '',
    status: enquiry.status || 'new',
    notes: enquiry.notes || '',
    createdAt: enquiry.createdAt,
    updatedAt: enquiry.updatedAt,
    tags: enquiry.tags || [],
  }
}

/**
 * Validate enquiry status
 */
export const validStatuses = ['new', 'in-progress', 'resolved', 'closed', 'spam']

export const isValidStatus = (status) => {
  return validStatuses.includes(String(status).toLowerCase())
}

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    new: 'red',
    'in-progress': 'yellow',
    resolved: 'green',
    closed: 'gray',
    spam: 'red',
  }
  return colors[status] || 'gray'
}

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculate days since enquiry was created
 */
export const daysSinceCreated = (createdAt) => {
  const now = new Date()
  const created = new Date(createdAt)
  const diff = now.getTime() - created.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Check if enquiry is new (less than 24 hours)
 */
export const isNewEnquiry = (createdAt) => {
  return daysSinceCreated(createdAt) === 0
}

/**
 * Sanitize enquiry data
 */
export const sanitizeEnquiry = (enquiry) => {
  return {
    ...enquiry,
    email: String(enquiry.email).toLowerCase().trim(),
    phone: String(enquiry.phone || '').trim(),
    name: String(enquiry.name || '').trim(),
    message: String(enquiry.message || enquiry.query || '').trim(),
    notes: String(enquiry.notes || '').trim(),
  }
}

/**
 * Generate enquiry summary
 */
export const generateEnquirySummary = (enquiries) => {
  if (!Array.isArray(enquiries) || enquiries.length === 0) {
    return {
      total: 0,
      byStatus: {},
      avgResponseRate: 0,
    }
  }

  const byStatus = {}
  let responded = 0

  enquiries.forEach(e => {
    const status = e.status || 'unknown'
    byStatus[status] = (byStatus[status] || 0) + 1

    if (e.notes && e.notes.length > 0) {
      responded++
    }
  })

  return {
    total: enquiries.length,
    byStatus,
    avgResponseRate: ((responded / enquiries.length) * 100).toFixed(2),
    responded,
    pending: enquiries.length - responded,
  }
}
