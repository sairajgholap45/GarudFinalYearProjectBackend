import { listEnquiries, getEnquiryById } from '../repositories/enquiryRepository.js'
import { getCompanyProfile, getSiteContent } from './siteController.js'

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

/**
 * Get admin dashboard statistics and summary
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const enquiries = await withTimeout(
      listEnquiries(),
      7000,
      'Database request timed out',
    )

    const stats = {
      totalEnquiries: enquiries.length,
      newEnquiries: enquiries.filter(e => e.status === 'new').length,
      inProgressEnquiries: enquiries.filter(e => e.status === 'in-progress').length,
      resolvedEnquiries: enquiries.filter(e => e.status === 'resolved').length,
      closedEnquiries: enquiries.filter(e => e.status === 'closed').length,
      recentEnquiries: enquiries.slice(-5).reverse(),
      lastUpdated: new Date().toISOString(),
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get all enquiries with filtering and sorting
 */
export const getAllEnquiriesAdmin = async (req, res, next) => {
  try {
    const { status, sortBy = 'createdAt', order = 'desc', limit, offset = 0 } = req.query

    let enquiries = await withTimeout(
      listEnquiries(),
      7000,
      'Database request timed out',
    )

    // Filter by status if provided
    if (status && status !== 'all') {
      enquiries = enquiries.filter(e => e.status === status)
    }

    // Sort
    const sortOrder = order === 'asc' ? 1 : -1
    enquiries.sort((a, b) => {
      const aVal = a[sortBy] || ''
      const bVal = b[sortBy] || ''

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * sortOrder
      }
      return (aVal - bVal) * sortOrder
    })

    // Pagination
    const total = enquiries.length
    const start = parseInt(offset) || 0
    const end = limit ? start + parseInt(limit) : enquiries.length
    const paginated = enquiries.slice(start, end)

    res.json({
      success: true,
      total,
      offset: start,
      limit: limit ? parseInt(limit) : total,
      count: paginated.length,
      enquiries: paginated,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Export enquiries as JSON or CSV
 */
export const exportEnquiries = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query

    let enquiries = await withTimeout(
      listEnquiries(),
      7000,
      'Database request timed out',
    )

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Message', 'Created', 'Updated']
      const rows = enquiries.map(e => [
        e.id || '',
        e.name || '',
        e.email || '',
        e.phone || '',
        e.status || '',
        (e.message || e.query || '').replace(/,/g, ';'),
        e.createdAt || '',
        e.updatedAt || '',
      ])

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="enquiries-${Date.now()}.csv"`)
      res.send(csv)
    } else {
      // JSON export
      res.setHeader('Content-Type', 'application/json')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="enquiries-${Date.now()}.json"`,
      )
      res.json({
        exportedAt: new Date().toISOString(),
        totalRecords: enquiries.length,
        enquiries,
      })
    }
  } catch (error) {
    next(error)
  }
}

/**
 * Get enquiry analytics and insights
 */
export const getEnquiryAnalytics = async (req, res, next) => {
  try {
    const enquiries = await withTimeout(
      listEnquiries(),
      7000,
      'Database request timed out',
    )

    // Status distribution
    const statusDistribution = {}
    enquiries.forEach(e => {
      statusDistribution[e.status] = (statusDistribution[e.status] || 0) + 1
    })

    // Time-based analytics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)

    const thisMonth = new Date(today)
    thisMonth.setMonth(thisMonth.getMonth() - 1)

    const todayCount = enquiries.filter(
      e => new Date(e.createdAt).getTime() >= today.getTime(),
    ).length

    const thisWeekCount = enquiries.filter(
      e => new Date(e.createdAt).getTime() >= thisWeek.getTime(),
    ).length

    const thisMonthCount = enquiries.filter(
      e => new Date(e.createdAt).getTime() >= thisMonth.getTime(),
    ).length

    // Response time analysis (if notes exist, estimate response)
    const respondedEnquiries = enquiries.filter(e => e.notes && e.notes.length > 0)

    const analytics = {
      totalEnquiries: enquiries.length,
      statusDistribution,
      timeframeStats: {
        today: todayCount,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount,
      },
      responseStats: {
        responded: respondedEnquiries.length,
        pending: enquiries.length - respondedEnquiries.length,
        responseRate: enquiries.length ? (respondedEnquiries.length / enquiries.length * 100).toFixed(2) : 0,
      },
    }

    res.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Bulk update enquiry status
 */
export const bulkUpdateEnquiries = async (req, res, next) => {
  try {
    const { ids, status } = req.body

    if (!Array.isArray(ids) || !status) {
      res.status(400).json({
        success: false,
        error: 'ids array and status are required',
      })
      return
    }

    // This would require a bulkUpdate method in the repository
    // For now, we'll return a not-implemented response
    res.status(501).json({
      success: false,
      message: 'Bulk update not yet implemented',
      hint: 'Use individual PATCH requests for each enquiry',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get admin activity log
 */
export const getActivityLog = async (req, res, next) => {
  try {
    // This would require a separate activity log collection/table
    // For now, return a placeholder
    res.json({
      success: true,
      data: [],
      message: 'Activity logging not yet implemented',
    })
  } catch (error) {
    next(error)
  }
}
