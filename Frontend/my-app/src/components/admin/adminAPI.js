/**
 * Admin API Services - endpoints đối chiếu Postman
 */
import { INIT_CUSTOMERS, INIT_FLIGHTS, INIT_TICKETS, INIT_LOGS, TOP_ROUTES } from './mockData'

const BASE = '/api'

function getToken() {
  // Keycloak luu token theo 2 cach pho bien:
  // 1. Raw JWT string: localStorage.setItem('access_token', jsonData.access_token)
  // 2. JSON object:    localStorage.setItem('kc_auth', JSON.stringify(jsonData))

  // Uu tien: raw JWT string truoc (cach Postman script luu: set("token", access_token))
  const RAW_KEYS = ['access_token', 'token', 'kc_token', 'auth_token', 'adminToken']
  for (const key of RAW_KEYS) {
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key)
    if (raw && raw.startsWith('ey')) {
      console.log(`%c[Token] Found at "${key}"`, 'color:#22c55e')
      return raw
    }
  }

  // Fallback: JSON object { access_token: "..." } — Keycloak JS adapter luu kieu nay
  const JSON_KEYS = ['kc_auth', 'keycloak', 'auth', 'user', 'session']
  for (const key of JSON_KEYS) {
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key)
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      // Keycloak response: { access_token, refresh_token, token_type, ... }
      const t = parsed?.access_token ?? parsed?.token ?? null
      if (t && t.startsWith('ey')) {
        console.log(`%c[Token] Found in JSON at "${key}"`, 'color:#22c55e')
        return t
      }
    } catch {}
  }

  console.warn('[Token] No token — dang nhap chua? Keys hien co:', Object.keys(localStorage))
  return null
}

// Ham tien ich: goi sau khi login thanh cong
// Dung: saveKeycloakToken(response) — response la JSON tu Keycloak
export function saveKeycloakToken(kcResponse) {
  if (kcResponse?.access_token) {
    localStorage.setItem('access_token', kcResponse.access_token)
    if (kcResponse.refresh_token) {
      localStorage.setItem('refresh_token', kcResponse.refresh_token)
    }
    console.log('%c[Token] Saved to localStorage.access_token', 'color:#22c55e')
  }
}

// Ham xoa token khi logout
export function clearToken() {
  ;['access_token', 'refresh_token', 'token', 'kc_token'].forEach(k => localStorage.removeItem(k))
  console.log('[Token] Cleared')
}

function mapFlight(f) {
  if (!f) return {}
  const route = f.route || {}
  const aircraft = f.aircraft || {}
  // Parse ISO timestamps: "2026-03-19T03:00:00.000000Z"
  const std = f.std ? new Date(f.std) : null
  const sta = f.sta ? new Date(f.sta) : null
  const depDate = f.departure_date ? new Date(f.departure_date) : std
  return {
    id: String(f.id ?? ''),
    flight_number: f.flight_number ?? '',
    from: route.from ?? '',
    to: route.to ?? '',
    date: depDate ? depDate.toISOString().split('T')[0] : '',
    dep: std ? std.toTimeString().slice(0, 5) : '',
    arr: sta ? sta.toTimeString().slice(0, 5) : '',
    aircraft: aircraft.model ?? '',
    status: (f.status ?? 'SCHEDULED').toLowerCase(),
    // Fields for display compatibility - API doesn't return these
    seats: aircraft.model?.includes('A321') ? 180 : (aircraft.model?.includes('A350') ? 300 : 180),
    sold: 0, // API doesn't return this
    price: 0, // API doesn't return this
    raw: f // Keep raw data if needed
  }
}
function normalizeList(data, hints = []) {
  if (Array.isArray(data)) return data
  const keys = [...hints, 'data', 'content', 'items', 'result', 'results', 'list']
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k]
  }
  return []
}

async function apiFetch(method, path, body = null) {
  const token = getToken()
  const url = `${BASE}${path}`
  console.log(`%c[API] ${method} ${url}`, 'color:#3b82f6;font-weight:bold', token ? 'WITH TOKEN' : 'NO TOKEN')
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  })
  console.log(`%c[API] <- ${res.status}`, res.ok ? 'color:#22c55e' : 'color:#ef4444')
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message ?? data?.error ?? data?.detail ?? `HTTP ${res.status}`)
  return data
}

// DASHBOARD
export const dashboardAPI = {
  getStats: async () => {
    try {
      const d = await apiFetch('GET', '/admin/dashboard/summary')
      // Response: { success, message, data: { period, financials, operations } }
      const data = d.data ?? d
      return {
        revenue: data?.financials?.gross_revenue ?? 0,
        netRevenue: data?.financials?.net_revenue ?? 0,
        refundedAmount: data?.financials?.refunded_amount ?? 0,
        totalBookings: data?.operations?.total_bookings ?? 0,
        totalFlights: data?.operations?.total_flights ?? 0,
        period: data?.period ?? {}
      }
    } catch (err) {
      console.warn('[dashboardAPI.getStats] mock:', err.message)
      return { revenue: 3600000, netRevenue: 3600000, refundedAmount: 0, totalBookings: 3, totalFlights: 0, period: {} }
    }
  },
  getRevenueChart: async (startDate = '', endDate = '') => {
    try {
      const qs = new URLSearchParams()
      if (startDate) qs.set('start_date', startDate)
      if (endDate) qs.set('end_date', endDate)
      const d = await apiFetch('GET', `/admin/revenue-chart?${qs.toString()}`)
      // Response: { success, message, data: { labels: [], datasets: [{name, type, data: []}, ...] } }
      const chartData = d.data ?? d
      return {
        labels: chartData.labels ?? [],
        datasets: chartData.datasets ?? []
      }
    } catch (err) {
      console.warn('[dashboardAPI.getRevenueChart] mock:', err.message)
      return {
        labels: ['12/03', '13/03', '14/03', '15/03', '16/03', '17/03', '18/03'],
        datasets: [
          { name: 'Doanh thu gộp', type: 'bar', data: [320, 410, 290, 480, 560, 390, 510] },
          { name: 'Doanh thu thuần', type: 'line', data: [280, 380, 250, 450, 520, 360, 480] }
        ]
      }
    }
  }
}

// Map backend user -> frontend user format
// Backend: { id, keycloak_id, email, full_name, phone_number, role, status, created_at }
// Frontend: { id, name, email, phone, status, tickets, joined }
// "Van A Nguyen" -> "Nguyen Van A" (dao ten tieng Viet: ho ten dem + ten)
function reverseViName(fullName) {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName
  // Lay phan cuoi (ten) dua len dau, phan con lai (ho ten dem) xuong sau
  const last = parts[parts.length - 1]
  const rest = parts.slice(0, -1).join(' ')
  return `${last} ${rest}`
}

function mapUser(u) {
  if (!u) return {}
  const rawName = u.full_name ?? u.name ?? ''
  return {
    id:      String(u.id ?? ''),
    name:    reverseViName(rawName),
    nameRaw: rawName,
    email:   u.email        ?? '',
    phone:   u.phone_number ?? u.phone ?? '',
    status:  u.status       ?? 'active',
    role:    u.role         ?? 'customer',
    tickets: u.tickets      ?? 0,
    joined:  u.created_at ? u.created_at.substring(0, 10) : (u.joined ?? ''),
  }
}

// CUSTOMERS
// GET  /admin/users
// GET  /admin/users/search?email=...
// GET  /admin/users/{id}
// POST /admin/users
// PUT  /admin/users/{id}
// PUT  /admin/users/{id}/disable
// PUT  /admin/users/{id}/active
export const customerAPI = {
  getAll: async () => {
    try {
      const d = await apiFetch('GET', '/admin/users')
      const list = normalizeList(d, ['data', 'users', 'customers'])
      console.log(`[customerAPI.getAll] list: ${list.length}`)

      // getAll chi tra { id, email } — goi them getById de lay full_name, phone, status
      const detailed = await Promise.all(
        list.map(async (u) => {
          try {
            const detail = await apiFetch('GET', `/admin/users/${u.id}`)
            return mapUser(detail?.data ?? detail)
          } catch {
            return mapUser(u) // fallback neu getById loi
          }
        })
      )
      console.log(`[customerAPI.getAll] enriched: ${detailed.length}`, detailed[0])
      return detailed
    } catch (err) {
      console.warn('[customerAPI.getAll] mock:', err.message)
      return INIT_CUSTOMERS
    }
  },
  search: async (email) => {
    try {
      const d = await apiFetch('GET', `/admin/users/search?email=${encodeURIComponent(email)}`)
      return normalizeList(d, ['users'])
    } catch (err) {
      console.warn('[customerAPI.search] mock:', err.message)
      return INIT_CUSTOMERS.filter(c => c.email.includes(email))
    }
  },
  getById: async (id) => {
    try {
      const d = await apiFetch('GET', `/admin/users/${id}`)
      // Response: { success, data: { id, keycloak_id, email, full_name, phone_number, role, status, ... } }
      return mapUser(d?.data ?? d)
    } catch (err) {
      return INIT_CUSTOMERS.find(c => c.id === id) ?? {}
    }
  },
  create: async (body) => apiFetch('POST', '/admin/users', body),
  updateProfile: async (id, body) => apiFetch('PUT', `/admin/users/${id}`, body),
  disable: async (id) => apiFetch('PUT', `/admin/users/${id}/disable`),
  active: async (id) => apiFetch('PUT', `/admin/users/${id}/active`),
  toggleStatus: async (id, currentStatus) => {
    if (currentStatus === 'active') return apiFetch('PUT', `/admin/users/${id}/disable`)
    return apiFetch('PUT', `/admin/users/${id}/active`)
  },
  delete: async (id) => apiFetch('PUT', `/admin/users/${id}/disable`)
}

// FLIGHTS (thực tế: /admin/flight-instances)
// GET  /admin/flight-instances
// GET  /admin/flight-instances/filter?route_id=&status=&from_date=&to_date=&page=
// GET  /admin/flight-instances/{id}
// POST /admin/flight-instances
export const flightAPI = {
  getAll: async (params = {}) => {
    try {
      // Fetch all pages to get total data (e.g., 56 flights across 6 pages)
      const fetchPage = async (page = 1, accumulated = []) => {
        const p = new URLSearchParams({ per_page: '100', page: String(page), ...params })
        const d = await apiFetch('GET', `/admin/flight-instances?${p.toString()}`)
        
        const list = normalizeList(d, ['data', 'flightInstances', 'flight_instances', 'flights'])
        const meta = d.meta ?? d.pagination ?? {}
        const allData = [...accumulated, ...list]
        
        const lastPage = meta.last_page ?? meta.lastPage ?? 1
        if (page < lastPage && list.length > 0) {
          return fetchPage(page + 1, allData)
        }
        return allData
      }
      
      const allFlights = await fetchPage(1)
      console.log(`[flightAPI.getAll] Total flights: ${allFlights.length}`)
      return allFlights.map(mapFlight)
    } catch (err) {
      console.warn('[flightAPI.getAll] mock:', err.message)
      return INIT_FLIGHTS
    }
  },
  getPage: async ({ page = 1, per_page = 10 } = {}) => {
    try {
      const p = new URLSearchParams({ per_page: String(per_page), page: String(page) })
      const d = await apiFetch('GET', `/admin/flight-instances?${p.toString()}`)
      
      const list = normalizeList(d, ['data', 'flightInstances', 'flight_instances', 'flights'])
      const meta = d.meta ?? d.pagination ?? { current_page: page, per_page, total: list.length, last_page: 1 }
      
      return {
        data: list.map(mapFlight),
        meta: {
          current_page: meta.current_page ?? page,
          per_page: meta.per_page ?? per_page,
          total: meta.total ?? list.length,
          last_page: meta.last_page ?? 1
        }
      }
    } catch (err) {
      console.warn('[flightAPI.getPage] mock:', err.message)
      // Return mock data paginated
      const start = (page - 1) * per_page
      const end = start + per_page
      return {
        data: INIT_FLIGHTS.slice(start, end),
        meta: { current_page: page, per_page, total: INIT_FLIGHTS.length, last_page: Math.ceil(INIT_FLIGHTS.length / per_page) }
      }
    }
  },
  filter: async ({ status, from_date, to_date, page = 1, route_id } = {}) => {
    try {
      const p = new URLSearchParams()
      if (route_id) p.set('route_id', route_id)
      if (status) p.set('status', status)
      if (from_date) p.set('from_date', from_date)
      if (to_date) p.set('to_date', to_date)
      p.set('page', page)
      const d = await apiFetch('GET', `/admin/flight-instances/filter?${p.toString()}`)
      return normalizeList(d, ['flightInstances', 'flights'])
    } catch (err) {
      console.warn('[flightAPI.filter] mock:', err.message)
      return INIT_FLIGHTS
    }
  },
  getById: async (id) => {
    try {
      return await apiFetch('GET', `/admin/flight-instances/${id}`)
    } catch (err) {
      return INIT_FLIGHTS.find(f => f.id === id) ?? {}
    }
  },
  create: async (body) => apiFetch('POST', '/admin/flight-instances', body),
  generate: async ({ from, to, date, count, price }) => {
    // Transform frontend form data to backend expected format
    // Backend requires: route_id, aircraft_id, flight_number, departure_date, departure_time
    const flightNumber = `VN${Math.floor(600 + Math.random() * 399)}`
    const aircraftId = 1 // Default aircraft ID - should be selected from available aircrafts
    
    // Map from/to to route_id (this is simplified - ideally should lookup from routes API)
    const routeMap = { 'HAN-SGN': 1, 'HAN-DAD': 2, 'SGN-DAD': 3, 'SGN-HAN': 4, 'DAD-HAN': 5, 'DAD-SGN': 6 }
    const routeKey = `${from}-${to}`
    const routeId = routeMap[routeKey] || 1
    
    const results = []
    const GEN_TIMES = [['06:00', '08:10'], ['10:00', '12:10'], ['14:00', '16:10'], ['18:00', '20:10']]
    
    for (let i = 0; i < count; i++) {
      const [depTime, arrTime] = GEN_TIMES[i % 4]
      const body = {
        route_id: routeId,
        aircraft_id: aircraftId,
        flight_number: flightNumber,
        departure_date: date,
        departure_time: depTime
      }
      
      try {
        const result = await apiFetch('POST', '/admin/flight-instances', body)
        results.push(result)
      } catch (err) {
        console.warn(`[flightAPI.generate] Failed to create flight ${i + 1}:`, err.message)
        throw err
      }
    }
    
    return { success: true, created: results.length, data: results }
  },
  update: async (id, body) => apiFetch('PUT', `/admin/flight-instances/${id}`, body),
  delete: async (id) => apiFetch('DELETE', `/admin/flight-instances/${id}`)
}

// SCHEDULES (MOI)
// GET  /admin/schedules?per_page=&page=
// POST /admin/schedules
// PUT  /admin/schedules/{id}/reactivate
// PUT  /admin/schedules/{id}/phase-out
export const scheduleAPI = {
  getAll: async ({ per_page = 10, page = 1 } = {}) => {
    try {
      const d = await apiFetch('GET', `/admin/schedules?per_page=${per_page}&page=${page}`)
      const list = normalizeList(d, ['schedules'])
      console.log(`[scheduleAPI.getAll] OK: ${list.length}`)
      return list
    } catch (err) {
      console.warn('[scheduleAPI.getAll] mock:', err.message)
      return []
    }
  },
  create: async (body) => apiFetch('POST', '/admin/schedules', body),
  reactivate: async (id) => apiFetch('PUT', `/admin/schedules/${id}/reactivate`),
  phaseOut: async (id) => apiFetch('PUT', `/admin/schedules/${id}/phase-out`)
}

// TICKETS
export const ticketAPI = {
  getAll: async () => {
    try {
      const d = await apiFetch('GET', '/admin/tickets')
      const list = normalizeList(d, ['tickets', 'bookings'])
      console.log(`[ticketAPI.getAll] OK: ${list.length}`)
      return list
    } catch (err) {
      console.warn('[ticketAPI.getAll] mock:', err.message)
      return INIT_TICKETS
    }
  },
  getById: async (id) => {
    try {
      return await apiFetch('GET', `/admin/tickets/${id}`)
    } catch (err) {
      return INIT_TICKETS.find(t => t.id === id) ?? {}
    }
  },
  exchange: async (id, body) => apiFetch('POST', `/admin/tickets/${id}/exchange`, body),
  refund: async (id, body = {}) => apiFetch('POST', `/admin/tickets/${id}/refund`, body),
  cancel: async (id, body = {}) => apiFetch('POST', `/admin/tickets/${id}/cancel`, body)
}

// STATS
export const statsAPI = {
  getStats: async () => {
    try {
      const d = await apiFetch('GET', '/admin/stats')
      return {
        totalRevenue: d.totalRevenue ?? d.revenue ?? 0,
        fillRate: d.fillRate ?? d.fill_rate ?? 0,
        refundedTickets: d.refundedTickets ?? d.refunds ?? 0,
        cancelledTickets: d.cancelledTickets ?? d.cancelled ?? 0,
      }
    } catch (err) {
      console.warn('[statsAPI.getStats] mock:', err.message)
      return { totalRevenue: 4875000000, fillRate: 78.4, refundedTickets: 142, cancelledTickets: 38 }
    }
  },
  getTopRoutes: async () => {
    try {
      const d = await apiFetch('GET', '/admin/stats/top-routes')
      return normalizeList(d, ['routes', 'topRoutes', 'top_routes'])
    } catch (err) {
      console.warn('[statsAPI.getTopRoutes] mock:', err.message)
      return TOP_ROUTES
    }
  },
  getLoadFactor: async (startDate = '', endDate = '') => {
    try {
      const qs = new URLSearchParams()
      if (startDate) qs.set('start_date', startDate)
      if (endDate) qs.set('end_date', endDate)
      const d = await apiFetch('GET', `/admin/load-factor?${qs.toString()}`)
      // Response: { success, message, data: { overall, chart_by_route } }
      const data = d.data ?? d
      return {
        overall: data?.overall ?? { load_factor_percentage: 0, total_seats_supplied: 0, total_seats_sold: 0 },
        chartByRoute: data?.chart_by_route ?? { labels: [], datasets: [] }
      }
    } catch (err) {
      console.warn('[statsAPI.getLoadFactor] mock:', err.message)
      return { 
        overall: { load_factor_percentage: 0, total_seats_supplied: 664, total_seats_sold: 0 },
        chartByRoute: { labels: ['HAN - DAD', 'SGN - PXU', 'PXU - SGN'], datasets: [{ name: 'Tỉ lệ lấp đầy (%)', data: [0, 0, 0] }] }
      }
    }
  },
  exportPDF: async (startDate, endDate) => {
    try {
      const qs = new URLSearchParams()
      if (startDate) qs.set('start_date', startDate)
      if (endDate) qs.set('end_date', endDate)
      const d = await apiFetch('GET', `/admin/reports/export-pdf?${qs.toString()}`)
      return d
    } catch (err) {
      console.warn('[statsAPI.exportPDF] mock:', err.message)
      return { success: false, message: 'PDF export not available' }
    }
  }
}

// LOGS
export const logsAPI = {
  getAll: async () => {
    try {
      const d = await apiFetch('GET', '/admin/logs')
      const list = normalizeList(d, ['logs', 'auditLogs', 'audit_logs'])
      console.log(`[logsAPI.getAll] OK: ${list.length}`)
      return list
    } catch (err) {
      console.warn('[logsAPI.getAll] mock:', err.message)
      return INIT_LOGS
    }
  },
  search: async (query, type) => {
    try {
      const p = new URLSearchParams()
      if (query) p.set('search', query)
      if (type && type !== 'all') p.set('type', type)
      const d = await apiFetch('GET', `/admin/logs?${p.toString()}`)
      return normalizeList(d, ['logs', 'auditLogs'])
    } catch (err) {
      console.warn('[logsAPI.search] mock:', err.message)
      return INIT_LOGS
    }
  }
}

// BACKUP
function saveLocalBackup(key, data) {
  try { localStorage.setItem(`backup_${key}`, JSON.stringify({ data, timestamp: new Date().toISOString() })) } catch {}
}
function getLocalBackup(key) {
  try { const b = localStorage.getItem(`backup_${key}`); return b ? JSON.parse(b).data : null } catch { return null }
}
export const backupAPI = {
  backupAll: async () => {
    try { await apiFetch('POST', '/admin/backup/all', { customers: INIT_CUSTOMERS, flights: INIT_FLIGHTS, tickets: INIT_TICKETS, logs: INIT_LOGS }) } catch {}
    ;['customers','flights','tickets','logs'].forEach(k => saveLocalBackup(k, { customers: INIT_CUSTOMERS, flights: INIT_FLIGHTS, tickets: INIT_TICKETS, logs: INIT_LOGS }[k]))
    return { success: true }
  },
  restoreCustomers: () => getLocalBackup('customers') ?? INIT_CUSTOMERS,
  restoreFlights: () => getLocalBackup('flights') ?? INIT_FLIGHTS,
  restoreTickets: () => getLocalBackup('tickets') ?? INIT_TICKETS,
  restoreLogs: () => getLocalBackup('logs') ?? INIT_LOGS,
}