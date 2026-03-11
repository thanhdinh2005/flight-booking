/**
 * Admin API Services
 * 
 * File này chứa các hàm gọi API cho từng section admin
 * Pattern: Gọi API, thành công → cập nhật dữ liệu, thất bại → fallback mock data
 * 
 * Cách sử dụng:
 * import { customerAPI, flightAPI, ticketAPI, statsAPI, logsAPI, dashboardAPI } from './adminAPI'
 * 
 * // Dashboard
 * const stats = await dashboardAPI.getStats()
 * 
 * // Customers
 * const customers = await customerAPI.getAll()
 * await customerAPI.create(data)
 * await customerAPI.toggleStatus(id)
 * await customerAPI.delete(id)
 * 
 * // Flights
 * const flights = await flightAPI.getAll()
 * await flightAPI.generate(data)
 * 
 * // Tickets
 * const tickets = await ticketAPI.getAll()
 * await ticketAPI.exchange(id, data)
 * await ticketAPI.refund(id)
 * await ticketAPI.cancel(id)
 * 
 * // Stats
 * const stats = await statsAPI.getStats()
 * const routes = await statsAPI.getTopRoutes()
 * 
 * // Logs
 * const logs = await logsAPI.getAll()
 * const logs = await logsAPI.search(query, type)
 */

import { INIT_CUSTOMERS, INIT_FLIGHTS, INIT_TICKETS, INIT_LOGS, TOP_ROUTES } from './mockData'

/* ─────────────────────────────────────────
   API Helpers — cùng pattern với Login.jsx
───────────────────────────────────────── */
const BASE = 'http://backend.test/api'

function getToken() {
  try {
    const token = localStorage.getItem('kc_token')
    if (!token) return null
    const parsed = JSON.parse(token)
    return parsed.access_token || parsed || null
  } catch { return null }
}

async function apiFetch(method, path, body = null) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || data.error || `Lỗi ${res.status}`)
  return data
}

// ═══════════════════════════════════
// DASHBOARD API
// ═══════════════════════════════════
export const dashboardAPI = {
  getStats: async () => {
    try {
      return await apiFetch('GET', '/admin/dashboard/stats')
    } catch (err) {
      console.warn('Dashboard stats API failed, using mock data:', err.message)
      return {
        revenue: 4875000000,
        tickets: 2841,
        flights: 48,
        customers: 1293,
        refunds: 142,
        cancelled: 38
      }
    }
  },
  
  getRevenueChart: async () => {
    try {
      return await apiFetch('GET', '/admin/dashboard/revenue')
    } catch (err) {
      console.warn('Revenue chart API failed, using mock data:', err.message)
      return [320, 410, 290, 480, 560, 390, 510]
    }
  }
}

// ═══════════════════════════════════
// CUSTOMERS API
// ═══════════════════════════════════
export const customerAPI = {
  getAll: async () => {
    try {
      return await apiFetch('GET', '/admin/customers')
    } catch (err) {
      console.warn('Customers API failed, using mock data:', err.message)
      return INIT_CUSTOMERS
    }
  },
  
  getById: async (id) => {
    try {
      return await apiFetch('GET', `/admin/customers/${id}`)
    } catch (err) {
      console.warn(`Customer ${id} API failed:`, err.message)
      return INIT_CUSTOMERS.find(c => c.id === id) || {}
    }
  },
  
  create: async (body) => {
    try {
      return await apiFetch('POST', '/admin/customers', body)
    } catch (err) {
      console.warn('Create customer API failed:', err.message)
      throw err
    }
  },
  
  toggleStatus: async (id) => {
    try {
      return await apiFetch('PUT', `/admin/customers/${id}/toggle-status`)
    } catch (err) {
      console.warn(`Toggle customer ${id} API failed:`, err.message)
      throw err
    }
  },
  
  delete: async (id) => {
    try {
      return await apiFetch('DELETE', `/admin/customers/${id}`)
    } catch (err) {
      console.warn(`Delete customer ${id} API failed:`, err.message)
      throw err
    }
  }
}

// ═══════════════════════════════════
// FLIGHTS API
// ═══════════════════════════════════
export const flightAPI = {
  getAll: async () => {
    try {
      return await apiFetch('GET', '/admin/flights')
    } catch (err) {
      console.warn('Flights API failed, using mock data:', err.message)
      return INIT_FLIGHTS
    }
  },
  
  getById: async (id) => {
    try {
      return await apiFetch('GET', `/admin/flights/${id}`)
    } catch (err) {
      console.warn(`Flight ${id} API failed:`, err.message)
      return INIT_FLIGHTS.find(f => f.id === id) || {}
    }
  },
  
  create: async (body) => {
    try {
      return await apiFetch('POST', '/admin/flights', body)
    } catch (err) {
      console.warn('Create flight API failed:', err.message)
      throw err
    }
  },
  
  generate: async (body) => {
    try {
      return await apiFetch('POST', '/admin/flights/generate', body)
    } catch (err) {
      console.warn('Generate flights API failed:', err.message)
      throw err
    }
  },
  
  update: async (id, body) => {
    try {
      return await apiFetch('PUT', `/admin/flights/${id}`, body)
    } catch (err) {
      console.warn(`Update flight ${id} API failed:`, err.message)
      throw err
    }
  },
  
  delete: async (id) => {
    try {
      return await apiFetch('DELETE', `/admin/flights/${id}`)
    } catch (err) {
      console.warn(`Delete flight ${id} API failed:`, err.message)
      throw err
    }
  }
}

// ═══════════════════════════════════
// TICKETS API
// ═══════════════════════════════════
export const ticketAPI = {
  getAll: async () => {
    try {
      return await apiFetch('GET', '/admin/tickets')
    } catch (err) {
      console.warn('Tickets API failed, using mock data:', err.message)
      return INIT_TICKETS
    }
  },
  
  getById: async (id) => {
    try {
      return await apiFetch('GET', `/admin/tickets/${id}`)
    } catch (err) {
      console.warn(`Ticket ${id} API failed:`, err.message)
      return INIT_TICKETS.find(t => t.id === id) || {}
    }
  },
  
  exchange: async (id, body) => {
    try {
      return await apiFetch('POST', `/admin/tickets/${id}/exchange`, body)
    } catch (err) {
      console.warn(`Exchange ticket ${id} API failed:`, err.message)
      throw err
    }
  },
  
  refund: async (id, body = {}) => {
    try {
      return await apiFetch('POST', `/admin/tickets/${id}/refund`, body)
    } catch (err) {
      console.warn(`Refund ticket ${id} API failed:`, err.message)
      throw err
    }
  },
  
  cancel: async (id, body = {}) => {
    try {
      return await apiFetch('POST', `/admin/tickets/${id}/cancel`, body)
    } catch (err) {
      console.warn(`Cancel ticket ${id} API failed:`, err.message)
      throw err
    }
  }
}

// ═══════════════════════════════════
// STATS API
// ═══════════════════════════════════
export const statsAPI = {
  getStats: async () => {
    try {
      return await apiFetch('GET', '/admin/stats')
    } catch (err) {
      console.warn('Stats API failed, using mock data:', err.message)
      return {
        totalRevenue: 4875000000,
        fillRate: 78.4,
        refundedTickets: 142,
        cancelledTickets: 38
      }
    }
  },
  
  getTopRoutes: async () => {
    try {
      return await apiFetch('GET', '/admin/stats/top-routes')
    } catch (err) {
      console.warn('Top routes API failed, using mock data:', err.message)
      return TOP_ROUTES
    }
  }
}

// ═══════════════════════════════════
// AUDIT LOGS API
// ═══════════════════════════════════
export const logsAPI = {
  getAll: async () => {
    try {
      return await apiFetch('GET', '/admin/logs')
    } catch (err) {
      console.warn('Logs API failed, using mock data:', err.message)
      return INIT_LOGS
    }
  },
  
  search: async (query, type) => {
    try {
      return await apiFetch('GET', `/admin/logs?search=${encodeURIComponent(query)}&type=${type}`)
    } catch (err) {
      console.warn('Log search API failed:', err.message)
      return INIT_LOGS
    }
  }
}

