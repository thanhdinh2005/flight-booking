/**
 * Admin API Services
 *
 * Exports:
 *   saveKeycloakToken(kcResponse)
 *   clearToken()
 *   dashboardAPI   — getStats, getRevenueChart
 *   customerAPI    — getAll, search, getById, create, updateRole, disable, active, toggleStatus, delete
 *   flightAPI      — getAll, getPage, filter, getById, create, generate, update, delete
 *   flightFilterAPI— filter (với pagination + status/date), getById
 *   scheduleAPI    — getAll, getById, create, reactivate, phaseOut
 *   ticketAPI      — getAll, getById, exchange, refund, cancel
 *   bookingRequestAPI — getAll, getById, approve, reject
 *   statsAPI       — getStats, getTopRoutes, getLoadFactor, exportPDF
 *   logsAPI        — getAll, search
 *   backupAPI      — backupAll, restoreCustomers, restoreFlights, restoreTickets, restoreLogs
 */

import { INIT_CUSTOMERS, INIT_FLIGHTS, INIT_TICKETS, INIT_LOGS, TOP_ROUTES } from './mockData'
import { getToken as getKeycloakToken, isTokenExpired } from '../../services/keycloakService'

const BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api'

// ─── TOKEN ───────────────────────────────────────────────────────────────────

function getAdminToken() {
  const token = getKeycloakToken()
  console.groupCollapsed('[Admin API] getAdminToken')
  console.log('hasToken:', !!token)
  console.log('isExpired:', isTokenExpired())
  console.log('preview:', token ? `${token.slice(0, 16)}...${token.slice(-10)}` : 'missing')
  if (!token) {
    console.warn('[Admin API] Không tìm thấy access token trong phiên đăng nhập admin.')
    console.groupEnd()
    return null
  }
  if (isTokenExpired()) {
    console.warn('[Admin API] Access token có dấu hiệu hết hạn, vẫn gửi lên backend để xác thực.')
  }
  console.groupEnd()
  return token
}

/** Lưu token Keycloak sau khi login thành công */
export function saveKeycloakToken(kcResponse) {
  if (kcResponse?.access_token) {
    sessionStorage.setItem('access_token', kcResponse.access_token)
    localStorage.setItem('access_token', kcResponse.access_token)
    if (kcResponse.refresh_token) {
      sessionStorage.setItem('refresh_token', kcResponse.refresh_token)
      localStorage.setItem('refresh_token', kcResponse.refresh_token)
    }
    console.log('%c[Token] Saved to localStorage.access_token', 'color:#22c55e')
  }
}

/** Xóa token khi logout */
export function clearToken() {
  ;['access_token', 'refresh_token', 'token', 'kc_token'].forEach(k => localStorage.removeItem(k))
  console.log('[Token] Cleared')
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Gọi API với Bearer token tự động */
async function apiFetch(method, path, body = null) {
  const token = getAdminToken()
  const url   = `${BASE}${path}`
  console.groupCollapsed(`[API] ${method} ${url}`)
  console.log('has token:', !!token)
  console.log('auth header preview:', token ? `Bearer ${token.slice(0, 16)}...${token.slice(-10)}` : 'missing')
  if (body) console.log('request body:', body)
  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  })
  const data = await res.json().catch(() => ({}))
  console.log('response status:', res.status)
  console.log('response ok:', res.ok)
  console.log('response data:', data)
  console.groupEnd()
  if (!res.ok) throw new Error(data?.message ?? data?.error ?? data?.detail ?? `HTTP ${res.status}`)
  return data
}

/** Lấy mảng từ response dù backend trả về array thẳng hay bọc trong object */
function normalizeList(data, hints = []) {
  if (Array.isArray(data)) return data
  const keys = [...hints, 'data', 'content', 'items', 'result', 'results', 'list']
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k]
  }
  return []
}

/** Chuẩn hóa meta phân trang */
function normalizeMeta(raw, { page, per_page, listLen }) {
  const m = raw?.data?.current_page
    ? raw.data
    : raw?.meta?.current_page
      ? raw.meta
      : raw?.pagination ?? raw?.meta ?? {}
  return {
    total:        m.total        ?? listLen,
    last_page:    m.last_page    ?? 1,
    current_page: m.current_page ?? page,
    per_page:     m.per_page     ?? per_page,
  }
}

// ─── MAPPERS ──────────────────────────────────────────────────────────────────

/**
 * Đảo tên tiếng Việt: "Van A Nguyen" → "Nguyen Van A"
 * (Backend lưu: first + middle + last; UI hiển thị: họ + tên đệm + tên)
 */
function reverseViName(fullName) {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName
  const last = parts[parts.length - 1]
  const rest = parts.slice(0, -1).join(' ')
  return `${last} ${rest}`
}

function normalizeUserStatus(status) {
  const normalized = String(status ?? '').trim().toLowerCase()
  if (['active', 'enabled', 'hoat_dong', 'hoạt động'].includes(normalized)) return 'active'
  if (['disabled', 'inactive', 'suspended', 'locked', 'blocked', 'tam_khoa', 'tạm khóa'].includes(normalized)) return 'disabled'
  return normalized || 'active'
}

/**
 * Backend user → frontend user
 * Backend: { id, keycloak_id, email, full_name, phone_number, role, status, created_at }
 */
function mapUser(u) {
  if (!u) return {}
  const rawName = u.full_name ?? u.name ?? ''
  const normalizedRole = String(u.role ?? 'customer').toLowerCase()
  return {
    id:      String(u.id ?? ''),
    name:    reverseViName(rawName),
    nameRaw: rawName,
    email:   u.email          ?? '',
    phone:   u.phone_number   ?? u.phone ?? '',
    status:  normalizeUserStatus(u.status),
    role:    normalizedRole,
    tickets: u.tickets        ?? 0,
    joined:  u.created_at ? u.created_at.substring(0, 10) : (u.joined ?? ''),
  }
}

/**
 * Backend flight-instance → frontend flight
 * Backend: { id, flight_number, route: {from,to}, aircraft: {model}, std, sta, departure_date, status }
 */
function mapFlight(f) {
  if (!f) return {}
  const route    = f.route    ?? {}
  const aircraft = f.aircraft ?? {}
  const std      = f.std            ? new Date(f.std)            : null
  const sta      = f.sta            ? new Date(f.sta)            : null
  const depDate  = f.departure_date ? new Date(f.departure_date) : std
  const etd      = f.etd            ? new Date(f.etd)            : null
  const eta      = f.eta            ? new Date(f.eta)            : null
  return {
    id:            String(f.id ?? ''),
    flight_number: f.flight_number ?? '',
    from:          route.from      ?? '',
    to:            route.to        ?? '',
    date:          depDate ? depDate.toISOString().split('T')[0] : '',
    dep:           std     ? std.toTimeString().slice(0, 5)      : '',
    arr:           sta     ? sta.toTimeString().slice(0, 5)      : '',
    aircraft:      aircraft.model  ?? '',
    registration_number: aircraft.registration_number ?? '',
    departure_date: f.departure_date ?? '',
    std:           f.std ?? '',
    sta:           f.sta ?? '',
    etd:           f.etd ?? '',
    eta:           f.eta ?? '',
    created_at:    f.created_at ?? '',
    updated_at:    f.updated_at ?? '',
    status:        (f.status ?? 'SCHEDULED').toLowerCase(),
    raw:   f,
  }
}

function formatDaysOfWeek(days) {
  if (!Array.isArray(days) || days.length === 0) return ''
  const labels = {
    1: 'T2',
    2: 'T3',
    3: 'T4',
    4: 'T5',
    5: 'T6',
    6: 'T7',
    7: 'CN',
  }
  return days
    .map(day => labels[day] ?? String(day))
    .join(', ')
}

/**
 * Backend schedule → frontend schedule
 * Backend: { id, flight_number, departure_time, days_of_week, is_active, route, aircraft }
 */
function mapSchedule(s) {
  if (!s) return {}
  const route = s.route ?? {}
  const aircraft = s.aircraft ?? {}
  return {
    id:          s.id ?? '',
    flightNumber:s.flight_number ?? '—',
    routeId:     route.id ?? s.route_id ?? '',
    route:       route.from && route.to ? `${route.from} → ${route.to}` : (s.route_name ?? '—'),
    from:        route.from ?? '',
    to:          route.to ?? '',
    depTime:     s.departure_time ?? s.dep_time ?? '',
    daysOfWeek:  Array.isArray(s.days_of_week) ? s.days_of_week : [],
    frequency:   formatDaysOfWeek(s.days_of_week),
    aircraft:    aircraft.model ?? s.aircraft_type ?? '',
    registrationNumber: aircraft.registration_number ?? '',
    aircraftId:  aircraft.id ?? s.aircraft_id ?? '',
    isActive:    typeof s.is_active === 'boolean' ? s.is_active : String(s.status ?? '').toLowerCase() === 'active',
    status:      typeof s.is_active === 'boolean'
      ? (s.is_active ? 'active' : 'phased_out')
      : (String(s.status ?? 'active').toLowerCase() === 'active' ? 'active' : 'phased_out'),
    raw:         s,
  }
}

/**
 * Backend booking-request → frontend booking request
 * Backend: { id, code, user: {id,full_name,email}, flight_instance: {flight_number,route,departure_date,std}, seat_count, total_price, status, created_at, note }
 */
function mapBookingRequest(r) {
  if (!r) return {}
  const ticket = r.ticket ?? {}
  return {
    id:         r.id ?? '',
    code:       r.code ?? r.booking_code ?? `REQ-${r.id}`,
    customer:   r.user?.full_name ?? r.customer_name ?? (r.user_id ? `User #${r.user_id}` : '—'),
    customerId: r.user?.id        ?? r.user_id ?? '',
    flight:     r.flight_instance?.flight_number ?? r.flight_number ?? `Ticket #${r.ticket_id ?? ticket.id ?? '—'}`,
    flightId:   r.flight_instance?.id ?? r.flight_instance_id ?? '',
    route:      r.flight_instance?.route
                  ? `${r.flight_instance.route.from} → ${r.flight_instance.route.to}`
                  : (r.route ?? '—'),
    date:       r.flight_instance?.departure_date ?? r.departure_date ?? '',
    dep:        r.flight_instance?.std
                  ? new Date(r.flight_instance.std).toTimeString().slice(0, 5)
                  : (r.dep ?? ''),
    seats:      ticket.seat_number ?? r.seat_count ?? r.seats ?? '—',
    totalPrice: Number(r.refund_amount ?? r.system_refund_amount ?? r.total_price ?? r.amount ?? 0),
    originalPrice: Number(ticket.ticket_price ?? 0),
    refundAmount: Number(r.refund_amount ?? 0),
    systemRefundAmount: Number(r.system_refund_amount ?? 0),
    ticketId:   r.ticket_id ?? ticket.id ?? '',
    bookingId:  r.booking_id ?? ticket.booking_id ?? '',
    seatClass:  ticket.seat_class ?? '—',
    requestType:(r.request_type ?? 'REFUND').toLowerCase(),
    reason:     r.reason ?? '',
    staffNote:  r.staff_note ?? '',
    processedAt:r.processed_at ? r.processed_at.substring(0, 10) : '',
    status:     (r.status ?? 'pending').toLowerCase(),
    createdAt:  r.created_at ? r.created_at.substring(0, 10) : '',
    note:       r.staff_note ?? r.note ?? r.rejection_reason ?? '',
    raw:        r,
  }
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// GET /admin/dashboard/summary
// GET /admin/revenue-chart?start_date=&end_date=

export const dashboardAPI = {
  getStats: async () => {
    try {
      const d    = await apiFetch('GET', '/admin/dashboard/summary')
      const data = d.data ?? d
      return {
        revenue:       data?.financials?.gross_revenue   ?? 0,
        netRevenue:    data?.financials?.net_revenue      ?? 0,
        refundedAmount:data?.financials?.refunded_amount  ?? 0,
        totalBookings: data?.operations?.total_bookings   ?? 0,
        totalFlights:  data?.operations?.total_flights    ?? 0,
        period:        data?.period ?? {},
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
      if (endDate)   qs.set('end_date',   endDate)
      const d         = await apiFetch('GET', `/admin/revenue-chart?${qs.toString()}`)
      const chartData = d.data ?? d
      return {
        labels:   chartData.labels   ?? [],
        datasets: chartData.datasets ?? [],
      }
    } catch (err) {
      console.warn('[dashboardAPI.getRevenueChart] mock:', err.message)
      return {
        labels: ['12/03', '13/03', '14/03', '15/03', '16/03', '17/03', '18/03'],
        datasets: [
          { name: 'Doanh thu gộp',  type: 'bar',  data: [320, 410, 290, 480, 560, 390, 510] },
          { name: 'Doanh thu thuần', type: 'line', data: [280, 380, 250, 450, 520, 360, 480] },
        ],
      }
    }
  },
}

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────
// GET  /admin/users
// GET  /admin/users/search?email=...
// GET  /admin/users/{id}
// POST /admin/users
// PUT  /admin/users/change-role/{id}
// PUT  /admin/users/{id}/disable
// PUT  /admin/users/{id}/active

export const customerAPI = {
  getAll: async () => {
    try {
      const d    = await apiFetch('GET', '/admin/users')
      const list = normalizeList(d, ['data', 'users', 'customers'])
      console.log(`[customerAPI.getAll] list: ${list.length}`)

      // Nếu getAll chỉ trả { id, email } thì enrich thêm chi tiết từng user
      const detailed = await Promise.all(
        list.map(async (u) => {
          try {
            const detail = await apiFetch('GET', `/admin/users/${u.id}`)
            return mapUser(detail?.data ?? detail)
          } catch {
            return mapUser(u) // fallback nếu getById lỗi
          }
        })
      )
      console.log(`[customerAPI.getAll] enriched: ${detailed.length}`)
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
      return mapUser(d?.data ?? d)
    } catch (err) {
      return INIT_CUSTOMERS.find(c => c.id === id) ?? {}
    }
  },

  create: async (body) => {
    const d = await apiFetch('POST', '/admin/users', body)
    return mapUser(d?.data ?? d)
  },

  updateRole: async (id, role) => apiFetch('PUT', `/admin/users/change-role/${id}`, {
    role: String(role ?? 'customer').toUpperCase(),
  }),

  /** PUT /admin/users/{id}/disable */
  disable: async (id) => apiFetch('PUT', `/admin/users/${id}/disable`),

  /** PUT /admin/users/{id}/active */
  active: async (id) => apiFetch('PUT', `/admin/users/${id}/active`),

  /** Tự động chọn disable/active dựa trên trạng thái hiện tại */
  toggleStatus: async (id, currentStatus) => {
    if (normalizeUserStatus(currentStatus) === 'active') return apiFetch('PUT', `/admin/users/${id}/disable`)
    return apiFetch('PUT', `/admin/users/${id}/active`)
  },

  delete: async (id) => apiFetch('PUT', `/admin/users/${id}/disable`),
}

// ─── FLIGHTS ─────────────────────────────────────────────────────────────────
// GET    /admin/flight-instances?per_page=&page=
// GET    /admin/flight-instances/filter?status=&from_date=&to_date=&route_id=&page=&per_page=
// GET    /admin/flight-instances/{id}
// POST   /admin/flight-instances
// PUT    /admin/flight-instances/{id}
// DELETE /admin/flight-instances/{id}

export const flightAPI = {
  /** Lấy tất cả chuyến bay (tự động lặp qua tất cả trang) */
  getAll: async (params = {}) => {
    try {
      const fetchPage = async (page = 1, accumulated = []) => {
        const p = new URLSearchParams({ per_page: '100', page: String(page), ...params })
        const d = await apiFetch('GET', `/admin/flight-instances?${p.toString()}`)
        const list = normalizeList(d, ['data', 'flightInstances', 'flight_instances', 'flights'])
        const meta = d.meta ?? d.pagination ?? {}
        const all  = [...accumulated, ...list]
        const lastPage = meta.last_page ?? meta.lastPage ?? 1
        if (page < lastPage && list.length > 0) return fetchPage(page + 1, all)
        return all
      }
      const allFlights = await fetchPage(1)
      console.log(`[flightAPI.getAll] Total: ${allFlights.length}`)
      return allFlights.map(mapFlight)
    } catch (err) {
      console.warn('[flightAPI.getAll] mock:', err.message)
      return INIT_FLIGHTS
    }
  },

  /** Lấy một trang chuyến bay */
  getPage: async ({ page = 1, per_page = 10 } = {}) => {
    try {
      const p    = new URLSearchParams({ per_page: String(per_page), page: String(page) })
      const d    = await apiFetch('GET', `/admin/flight-instances?${p.toString()}`)
      const list = normalizeList(d, ['data', 'flightInstances', 'flight_instances', 'flights'])
      return {
        data: list.map(mapFlight),
        meta: normalizeMeta(d, { page, per_page, listLen: list.length }),
      }
    } catch (err) {
      console.warn('[flightAPI.getPage] mock:', err.message)
      const start = (page - 1) * per_page
      return {
        data: INIT_FLIGHTS.slice(start, start + per_page),
        meta: { current_page: page, per_page, total: INIT_FLIGHTS.length, last_page: Math.ceil(INIT_FLIGHTS.length / per_page) },
      }
    }
  },

  /**
   * Lọc chuyến bay
   * GET /admin/flight-instances/filter?status=&from_date=&to_date=&route_id=&page=&per_page=
   */
  filter: async ({ status = '', from_date = '', to_date = '', route_id = '', page = 1, per_page = 10 } = {}) => {
    try {
      const p = new URLSearchParams({ page: String(page), per_page: String(per_page) })
      if (status)    p.set('status',    status.toUpperCase())
      if (from_date) p.set('from_date', from_date)
      if (to_date)   p.set('to_date',   to_date)
      if (route_id)  p.set('route_id',  String(route_id))
      const d    = await apiFetch('GET', `/admin/flight-instances/filter?${p.toString()}`)
      const list = normalizeList(d, ['data', 'flightInstances', 'flight_instances', 'flights'])
      console.log(`[flightAPI.filter] OK: ${list.length} (page ${page})`)
      return {
        data: list.map(mapFlight),
        meta: normalizeMeta(d, { page, per_page, listLen: list.length }),
      }
    } catch (err) {
      console.warn('[flightAPI.filter] mock:', err.message)
      return { data: INIT_FLIGHTS, meta: { total: INIT_FLIGHTS.length, last_page: 1, current_page: 1, per_page } }
    }
  },

  /** GET /admin/flight-instances/{id} */
  getById: async (id) => {
    try {
      const d = await apiFetch('GET', `/admin/flight-instances/${id}`)
      return mapFlight(d?.data ?? d)
    } catch (err) {
      return INIT_FLIGHTS.find(f => f.id === String(id)) ?? {}
    }
  },

  create: async (body) => apiFetch('POST', '/admin/flight-instances', body),

  /** Tạo nhiều chuyến bay tự động theo lịch giờ cố định */
  generate: async ({ from, to, date, count }) => {
    const flightNumber = `VN${Math.floor(600 + Math.random() * 399)}`
    const aircraftId   = 1
    const routeMap     = { 'HAN-SGN': 1, 'HAN-DAD': 2, 'SGN-DAD': 3, 'SGN-HAN': 4, 'DAD-HAN': 5, 'DAD-SGN': 6 }
    const routeId      = routeMap[`${from}-${to}`] || 1
    const GEN_TIMES    = [['06:00', '08:10'], ['10:00', '12:10'], ['14:00', '16:10'], ['18:00', '20:10']]
    const results      = []

    for (let i = 0; i < count; i++) {
      const [depTime] = GEN_TIMES[i % 4]
      const result = await apiFetch('POST', '/admin/flight-instances', {
        route_id:       routeId,
        aircraft_id:    aircraftId,
        flight_number:  flightNumber,
        departure_date: date,
        departure_time: depTime,
      })
      results.push(result)
    }
    console.log(`%c[flightAPI.generate] ✅ Created ${results.length} flights`, 'color:#22c55e')
    return { success: true, created: results.length, data: results }
  },

  update: async (id, body) => apiFetch('PUT',    `/admin/flight-instances/${id}`, body),
  delete: async (id)        => apiFetch('DELETE', `/admin/flight-instances/${id}`),
}

// Alias giữ tương thích với các component import flightFilterAPI
export const flightFilterAPI = {
  filter:  (params) => flightAPI.filter(params),
  getById: (id)     => flightAPI.getById(id),
}

// ─── SCHEDULES ───────────────────────────────────────────────────────────────
// GET  /admin/schedules?per_page=&page=
// GET  /admin/schedules/{id}
// POST /admin/schedules
// PUT  /admin/schedules/{id}/reactivate
// PUT  /admin/schedules/{id}/phase-out

export const scheduleAPI = {
  getAll: async ({ per_page = 10, page = 1 } = {}) => {
    try {
      const d    = await apiFetch('GET', `/admin/schedules?per_page=${per_page}&page=${page}`)
      const list = normalizeList(d, ['schedules', 'data'])
      console.log(`[scheduleAPI.getAll] OK: ${list.length}`)
      return {
        data: list.map(mapSchedule),
        meta: normalizeMeta(d, { page, per_page, listLen: list.length }),
      }
    } catch (err) {
      console.warn('[scheduleAPI.getAll] lỗi:', err.message)
      return { data: [], meta: { total: 0, last_page: 1, current_page: 1, per_page } }
    }
  },

  getById: async (id) => {
    try {
      const d = await apiFetch('GET', `/admin/schedules/${id}`)
      return mapSchedule(d?.data ?? d)
    } catch (err) {
      console.warn('[scheduleAPI.getById] lỗi:', err.message)
      return {}
    }
  },

  create: async (body) => apiFetch('POST', '/admin/schedules', body),

  /** PUT /admin/schedules/{id}/reactivate */
  reactivate: async (id) => {
    const d = await apiFetch('PUT', `/admin/schedules/${id}/reactivate`)
    console.log(`%c[scheduleAPI.reactivate] ✅ id=${id}`, 'color:#22c55e', d)
    return d
  },

  /** PUT /admin/schedules/{id}/phase-out */
  phaseOut: async (id) => {
    const d = await apiFetch('PUT', `/admin/schedules/${id}/phase-out`)
    console.log(`%c[scheduleAPI.phaseOut] ✅ id=${id}`, 'color:#f59e0b', d)
    return d
  },
}

// ─── TICKETS ─────────────────────────────────────────────────────────────────
// GET  /admin/tickets
// GET  /admin/tickets/{id}
// POST /admin/tickets/{id}/exchange
// POST /admin/tickets/{id}/refund
// POST /admin/tickets/{id}/cancel

export const ticketAPI = {
  getAll: async () => {
    try {
      const d    = await apiFetch('GET', '/admin/tickets')
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

  exchange: async (id, body)      => apiFetch('POST', `/admin/tickets/${id}/exchange`, body),
  refund:   async (id, body = {}) => apiFetch('POST', `/admin/tickets/${id}/refund`,   body),
  cancel:   async (id, body = {}) => apiFetch('POST', `/admin/tickets/${id}/cancel`,   body),
}

// ─── BOOKING REQUESTS ────────────────────────────────────────────────────────
// GET  /admin/booking-requests?status=&page=&per_page=
// GET  /admin/booking-requests/{id}
// POST /admin/booking-requests/{id}/approve
// POST /admin/booking-requests/{id}/reject

export const bookingRequestAPI = {
  /**
   * @param {{ status?: string, page?: number, per_page?: number }} params
   */
  getAll: async ({ status = '', page = 1, per_page = 20 } = {}) => {
    try {
      const p = new URLSearchParams({ page: String(page), per_page: String(per_page) })
      if (status && status !== 'all') p.set('status', status.toUpperCase())
      const d    = await apiFetch('GET', `/admin/booking-requests?${p.toString()}`)
      const list = Array.isArray(d?.data?.data)
        ? d.data.data
        : normalizeList(d, ['bookingRequests', 'booking_requests', 'requests', 'data'])
      console.log(`[bookingRequestAPI.getAll] OK: ${list.length}, status="${status}"`)
      return {
        data: list.map(mapBookingRequest),
        meta: normalizeMeta(d, { page, per_page, listLen: list.length }),
      }
    } catch (err) {
      console.warn('[bookingRequestAPI.getAll] lỗi:', err.message)
      return { data: [], meta: { total: 0, last_page: 1, current_page: 1, per_page } }
    }
  },

  getById: async (id) => {
    try {
      const d = await apiFetch('GET', `/admin/booking-requests/${id}`)
      return mapBookingRequest(d?.data ?? d)
    } catch (err) {
      console.warn('[bookingRequestAPI.getById] lỗi:', err.message)
      return {}
    }
  },

  /** POST /admin/booking-requests/{id}/approve */
  approve: async (id, body = {}) => {
    const d = await apiFetch('POST', `/admin/booking-requests/${id}/approve`, body)
    console.log(`%c[bookingRequestAPI.approve] ✅ id=${id}`, 'color:#22c55e', d)
    return d
  },

  /**
   * POST /admin/booking-requests/{id}/reject
   * @param {{ staff_note?: string }} body
   */
  reject: async (id, body = {}) => {
    const d = await apiFetch('POST', `/admin/booking-requests/${id}/reject`, body)
    console.log(`%c[bookingRequestAPI.reject] ✅ id=${id}`, 'color:#ef4444', d)
    return d
  },
}

// ─── STATS ────────────────────────────────────────────────────────────────────
// GET /admin/stats
// GET /admin/stats/top-routes
// GET /admin/load-factor?start_date=&end_date=
// GET /admin/reports/export-pdf?start_date=&end_date=

export const statsAPI = {
  getStats: async () => {
    try {
      const d = await apiFetch('GET', '/admin/stats')
      return {
        totalRevenue:     d.totalRevenue      ?? d.revenue  ?? 0,
        fillRate:         d.fillRate          ?? d.fill_rate ?? 0,
        refundedTickets:  d.refundedTickets   ?? d.refunds   ?? 0,
        cancelledTickets: d.cancelledTickets  ?? d.cancelled ?? 0,
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
      if (endDate)   qs.set('end_date',   endDate)
      const d    = await apiFetch('GET', `/admin/load-factor?${qs.toString()}`)
      const data = d.data ?? d
      return {
        overall:      data?.overall       ?? { load_factor_percentage: 0, total_seats_supplied: 0, total_seats_sold: 0 },
        chartByRoute: data?.chart_by_route ?? { labels: [], datasets: [] },
      }
    } catch (err) {
      console.warn('[statsAPI.getLoadFactor] mock:', err.message)
      return {
        overall:      { load_factor_percentage: 0, total_seats_supplied: 664, total_seats_sold: 0 },
        chartByRoute: { labels: ['HAN - DAD', 'SGN - PXU', 'PXU - SGN'], datasets: [{ name: 'Tỉ lệ lấp đầy (%)', data: [0, 0, 0] }] },
      }
    }
  },

  exportPDF: async (startDate = '', endDate = '') => {
    try {
      const qs = new URLSearchParams()
      if (startDate) qs.set('start_date', startDate)
      if (endDate)   qs.set('end_date',   endDate)
      return await apiFetch('GET', `/admin/reports/export-pdf?${qs.toString()}`)
    } catch (err) {
      console.warn('[statsAPI.exportPDF] mock:', err.message)
      return { success: false, message: 'PDF export not available' }
    }
  },
}

// ─── LOGS ─────────────────────────────────────────────────────────────────────
// GET /admin/logs?search=&type=

export const logsAPI = {
  getAll: async () => {
    try {
      const d    = await apiFetch('GET', '/admin/logs')
      const list = normalizeList(d, ['logs', 'auditLogs', 'audit_logs'])
      console.log(`[logsAPI.getAll] OK: ${list.length}`)
      return list
    } catch (err) {
      console.warn('[logsAPI.getAll] mock:', err.message)
      return INIT_LOGS
    }
  },

  search: async (query = '', type = '') => {
    try {
      const p = new URLSearchParams()
      if (query)                  p.set('search', query)
      if (type && type !== 'all') p.set('type',   type)
      const d = await apiFetch('GET', `/admin/logs?${p.toString()}`)
      return normalizeList(d, ['logs', 'auditLogs'])
    } catch (err) {
      console.warn('[logsAPI.search] mock:', err.message)
      return INIT_LOGS
    }
  },
}

// ─── BACKUP ───────────────────────────────────────────────────────────────────

function saveLocalBackup(key, data) {
  try {
    localStorage.setItem(`backup_${key}`, JSON.stringify({ data, timestamp: new Date().toISOString() }))
  } catch {}
}

function getLocalBackup(key) {
  try {
    const b = localStorage.getItem(`backup_${key}`)
    return b ? JSON.parse(b).data : null
  } catch {
    return null
  }
}

export const backupAPI = {
  backupAll: async () => {
    try {
      await apiFetch('POST', '/admin/backup/all', {
        customers: INIT_CUSTOMERS,
        flights:   INIT_FLIGHTS,
        tickets:   INIT_TICKETS,
        logs:      INIT_LOGS,
      })
    } catch {}
    ;['customers', 'flights', 'tickets', 'logs'].forEach(k =>
      saveLocalBackup(k, { customers: INIT_CUSTOMERS, flights: INIT_FLIGHTS, tickets: INIT_TICKETS, logs: INIT_LOGS }[k])
    )
    return { success: true }
  },
  restoreCustomers: () => getLocalBackup('customers') ?? INIT_CUSTOMERS,
  restoreFlights:   () => getLocalBackup('flights')   ?? INIT_FLIGHTS,
  restoreTickets:   () => getLocalBackup('tickets')   ?? INIT_TICKETS,
  restoreLogs:      () => getLocalBackup('logs')      ?? INIT_LOGS,
}
