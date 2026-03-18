const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080'
const REALM        = import.meta.env.VITE_KEYCLOAK_REALM || 'flight-booking-realm'
const CLIENT_ID    = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'frontend-client'
const BACKEND_URL  = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api'

// ─── Token Storage ────────────────────────────────────────────────────────────
export function saveToken(tokenData) {
  sessionStorage.setItem('access_token',  tokenData.access_token)
  sessionStorage.setItem('refresh_token', tokenData.refresh_token || '')
  sessionStorage.setItem('token_expiry',  Date.now() + tokenData.expires_in * 1000)
}

export function getToken() {
  return sessionStorage.getItem('access_token')
}

export function getAccessToken() {
  return sessionStorage.getItem('access_token')
}


export function clearToken() {
  sessionStorage.removeItem('access_token')
  sessionStorage.removeItem('refresh_token')
  sessionStorage.removeItem('token_expiry')
}

export function isTokenExpired() {
  const expiry = sessionStorage.getItem('token_expiry')
  return !expiry || Date.now() > parseInt(expiry)
}

export function isAuthenticated() {
  const token = getToken()
  return !!token && !isTokenExpired()
}

// ─── JWT Decode ───────────────────────────────────────────────────────────────
export function decodeToken(token) {
  try {
    const base64Payload = token.split('.')[1]
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload)
  } catch {
    return null
  }
}

// ─── Lấy roles từ token ───────────────────────────────────────────────────────
export function getRolesFromToken(token) {
  const decoded = decodeToken(token)
  if (!decoded) return []

  const realmRoles = decoded?.realm_access?.roles || []

  // Lọc bỏ các role hệ thống của Keycloak
  const systemRoles = [
    'default-roles-' + REALM,
    'offline_access',
    'uma_authorization',
  ]
  return realmRoles.filter((r) => !systemRoles.includes(r))
}

// ─── Lấy thông tin user từ token ──────────────────────────────────────────────
export function getUserFromToken(token) {
  const decoded = decodeToken(token)
  if (!decoded) return null
  return {
    id:       decoded.sub,
    email:    decoded.email,
    name:     decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim(),
    username: decoded.preferred_username,
    roles:    getRolesFromToken(token),
  }
}

// ─── Kiểm tra role ────────────────────────────────────────────────────────────
export function hasRole(role) {
  const token = getToken()
  if (!token) return false
  return getRolesFromToken(token).includes(role)
}

// ─── Redirect theo role ───────────────────────────────────────────────────────
// Roles: ADMIN | STAFF | CUSTOMER
export function redirectByRole(roles, navigate) {
  if (roles.includes('ADMIN')) {
    navigate('/admin')
  } else if (roles.includes('STAFF')) {
    navigate('/staff/dashboard')
  } else {
    // CUSTOMER hoặc không có role đặc biệt
    navigate('/home')
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginKeycloak(email, password) {
  const res = await fetch(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id:  CLIENT_ID,
        username:   email,
        password:   password,
      }),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    const msg = data.error_description || data.error || 'Đăng nhập thất bại'
    throw new Error(
      msg === 'Invalid user credentials'
        ? 'Email hoặc mật khẩu không đúng'
        : msg
    )
  }

  return data
}

// ─── Register (gọi backend Laravel) ──────────────────────────────────────────
export async function registerUser(payload) {
  const res = await fetch(`${BACKEND_URL}/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Đăng ký thất bại')
  }

  return data
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutKeycloak() {
  const refreshToken = sessionStorage.getItem('refresh_token')
  if (refreshToken) {
    await fetch(
      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({
          client_id:     CLIENT_ID,
          refresh_token: refreshToken,
        }),
      }
    ).catch(() => {})
  }
  clearToken()
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// Helper function to get auth headers
function getAuthHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  }
}

// ─── Search User (Admin) ──────────────────────────────────────────────────────
export async function searchUser(query) {
  const res = await fetch(`${BACKEND_URL}/admin/users/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Tìm kiếm user thất bại')
  return data
}

// ─── Get All Users (Admin) ────────────────────────────────────────────────────
export async function getAllUsers() {
  const res = await fetch(`${BACKEND_URL}/admin/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Lấy danh sách user thất bại')
  return data
}

// ─── Get User by Id (Admin) ───────────────────────────────────────────────────
export async function getUserById(userId) {
  const res = await fetch(`${BACKEND_URL}/admin/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Lấy thông tin user thất bại')
  return data
}

// ─── Create User (Admin) ──────────────────────────────────────────────────────
export async function createUser(payload) {
  const res = await fetch(`${BACKEND_URL}/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Tạo user thất bại')
  return data
}

// ─── Disable User (Admin) ─────────────────────────────────────────────────────
export async function disableUser(userId) {
  const res = await fetch(`${BACKEND_URL}/admin/users/${userId}/disable`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Vô hiệu hóa user thất bại')
  return data
}

// ─── Active User (Admin) ──────────────────────────────────────────────────────
export async function activeUser(userId) {
  const res = await fetch(`${BACKEND_URL}/admin/users/${userId}/active`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Kích hoạt user thất bại')
  return data
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFUND REQUEST (Staff & Customer)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Approve Refund Request (Staff) ─────────────────────────────────────────────
export async function approveRefundRequest(requestId) {
  const res = await fetch(`${BACKEND_URL}/staff/refund-requests/${requestId}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Phê duyệt hoàn tiền thất bại')
  return data
}

// ─── Reject Refund Request (Staff) ──────────────────────────────────────────────
export async function rejectRefundRequest(requestId, reason) {
  const res = await fetch(`${BACKEND_URL}/staff/refund-requests/${requestId}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Từ chối hoàn tiền thất bại')
  return data
}

// ─── Create Refund Request (Customer) ──────────────────────────────────────────
export async function createRefundRequest(payload) {
  const res = await fetch(`${BACKEND_URL}/refund-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Tạo yêu cầu hoàn tiền thất bại')
  return data
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLIGHT MANAGEMENT (Admin)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Get All Flights (Admin) ────────────────────────────────────────────────────
export async function getAllFlights() {
  const res = await fetch(`${BACKEND_URL}/admin/flights`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Lấy danh sách chuyến bay thất bại')
  return data
}

// ─── Create Manual Flight (Admin) ───────────────────────────────────────────────
export async function createManualFlight(payload) {
  const res = await fetch(`${BACKEND_URL}/admin/flights`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Tạo chuyến bay thất bại')
  return data
}

// ─── Update Flight Instance (Admin) ─────────────────────────────────────────────
export async function updateFlightInstance(flightId, payload) {
  const res = await fetch(`${BACKEND_URL}/admin/flights/${flightId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Cập nhật chuyến bay thất bại')
  return data
}

// ─── Filter Flight (Admin) ──────────────────────────────────────────────────────
export async function filterFlight(params) {
  const queryString = new URLSearchParams(params).toString()
  const res = await fetch(`${BACKEND_URL}/admin/flights/filter?${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Lọc chuyến bay thất bại')
  return data
}

// ─── Get Flight by Id (Admin) ─────────────────────────────────────────────────
export async function getFlightById(flightId) {
  const res = await fetch(`${BACKEND_URL}/admin/flights/${flightId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Lấy thông tin chuyến bay thất bại')
  return data
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLIGHT SCHEDULE (Admin)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Create Flight Schedule (Admin) ─────────────────────────────────────────────
export async function createFlightSchedule(payload) {
  const res = await fetch(`${BACKEND_URL}/admin/schedules`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Tạo lịch bay thất bại')
  return data
}

// ─── Get All Schedules (Admin) ────────────────────────────────────────────────
export async function getAllSchedules() {
  const res = await fetch(`${BACKEND_URL}/admin/schedules`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Lấy danh sách lịch bay thất bại')
  return data
}

// ─── Reactivate Schedule (Admin) ──────────────────────────────────────────────
export async function reactivateSchedule(scheduleId) {
  const res = await fetch(`${BACKEND_URL}/admin/schedules/${scheduleId}/reactivate`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Kích hoạt lại lịch bay thất bại')
  return data
}

// ─── Phase-out Schedule (Admin) ─────────────────────────────────────────────────
export async function phaseOutSchedule(scheduleId) {
  const res = await fetch(`${BACKEND_URL}/admin/schedules/${scheduleId}/phase-out`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Ngừng khai thác lịch bay thất bại')
  return data
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING & PAYMENT
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Create Booking ─────────────────────────────────────────────────────────────
export async function createBooking(payload) {
  const res = await fetch(`${BACKEND_URL}/bookings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Đặt vé thất bại')
  return data
}

// ─── Update Addon ───────────────────────────────────────────────────────────────
export async function updateAddon(bookingId, payload) {
  const res = await fetch(`${BACKEND_URL}/bookings/${bookingId}/addons`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Cập nhật dịch vụ bổ sung thất bại')
  return data
}

// ─── Create Payment (Customer) ──────────────────────────────────────────────────
export async function createPayment(payload) {
  const res = await fetch(`${BACKEND_URL}/payments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Tạo thanh toán thất bại')
  return data
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Search Flight ──────────────────────────────────────────────────────────────
export async function searchFlight(params) {
  const queryString = new URLSearchParams(params).toString()
  const res = await fetch(`${BACKEND_URL}/flights/search?${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Tìm kiếm chuyến bay thất bại')
  return data
}

// ─── Search Airport ─────────────────────────────────────────────────────────────
export async function searchAirport(query) {
  const res = await fetch(`${BACKEND_URL}/airports/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Tìm kiếm sân bay thất bại')
  return data
}