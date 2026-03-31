const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080'
const REALM        = import.meta.env.VITE_KEYCLOAK_REALM || 'flight-booking-realm'
const CLIENT_ID    = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'frontend-client'
const BACKEND_URL  = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE || 'https://backend.test/api'

const AUTH_STORAGE_KEYS = ['access_token', 'refresh_token', 'token_expiry']

function clearLegacyLocalAuth() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
}

clearLegacyLocalAuth()

// ─── Token Storage ────────────────────────────────────────────────────────────
export function saveToken(tokenData) {
  const expiry = tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : ''
  console.groupCollapsed('[Auth] saveToken')
  console.log('has access_token:', !!tokenData.access_token)
  console.log('token_type:', tokenData.token_type || 'unknown')
  console.log('expires_in:', tokenData.expires_in || 'missing')
  console.log('access token preview:', tokenData.access_token ? `${tokenData.access_token.slice(0, 20)}...${tokenData.access_token.slice(-12)}` : 'missing')
  console.groupEnd()
  clearLegacyLocalAuth()
  sessionStorage.setItem('access_token', tokenData.access_token || '')
  sessionStorage.setItem('refresh_token', tokenData.refresh_token || '')
  if (expiry) {
    sessionStorage.setItem('token_expiry', expiry)
  } else {
    sessionStorage.removeItem('token_expiry')
  }
}

export function getToken() {
  const sessionToken = sessionStorage.getItem('access_token')
  console.log('[Auth] getToken ->', {
    source: sessionToken ? 'sessionStorage' : 'none',
    hasToken: !!sessionToken,
    preview: sessionToken ? `${sessionToken.slice(0, 16)}...${sessionToken.slice(-10)}` : 'missing',
  })
  return sessionToken
}

export function getAccessToken() {
  return getToken()
}


export function clearToken() {
  AUTH_STORAGE_KEYS.forEach((key) => {
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  })
}

export function isTokenExpired() {
  const expiry = sessionStorage.getItem('token_expiry')
  if (!expiry) return false
  return Date.now() > parseInt(expiry, 10)
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

function normalizeAccountStatus(status) {
  const normalized = String(status ?? '').trim().toUpperCase()
  if (['INACTIVE', 'DISABLED', 'SUSPENDED', 'LOCKED', 'BLOCKED'].includes(normalized)) return 'INACTIVE'
  return normalized || 'ACTIVE'
}

export async function getAccountStatusByEmail(email, accessToken) {
  const listResponse = await getAllUsers(accessToken)
  const list = Array.isArray(listResponse)
    ? listResponse
    : listResponse?.data ?? listResponse?.users ?? listResponse?.items ?? listResponse?.results ?? []

  const matchedUser = Array.isArray(list)
    ? list.find((item) => String(item?.email ?? '').toLowerCase() === String(email ?? '').trim().toLowerCase())
    : null

  if (!matchedUser?.id) {
    throw new Error('Không tìm thấy thông tin tài khoản để kiểm tra trạng thái')
  }

  const detailResponse = await getUserById(matchedUser.id, accessToken)
  const detail = detailResponse?.data ?? detailResponse
  return normalizeAccountStatus(detail?.status)
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginKeycloak(email, password) {
  console.groupCollapsed('[Auth] loginKeycloak request')
  console.log('KEYCLOAK_URL:', KEYCLOAK_URL)
  console.log('REALM:', REALM)
  console.log('CLIENT_ID:', CLIENT_ID)
  console.log('username:', email)
  console.groupEnd()

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

  console.groupCollapsed('[Auth] loginKeycloak response')
  console.log('status:', res.status)
  console.log('ok:', res.ok)
  console.log('has access_token:', !!data?.access_token)
  console.log('token_type:', data?.token_type || 'missing')
  console.log('expires_in:', data?.expires_in || 'missing')
  console.log('access token preview:', data?.access_token ? `${data.access_token.slice(0, 20)}...${data.access_token.slice(-12)}` : 'missing')
  console.log('raw response:', data)
  console.groupEnd()

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

export async function forgotPassword(email) {
  const res = await fetch(`${BACKEND_URL}/forgot-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || 'Không gửi được yêu cầu quên mật khẩu')
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
function getAuthHeaders(accessToken) {
  const token = accessToken || getToken()
  return {
    'Accept': 'application/json',
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
export async function getAllUsers(accessToken) {
  const res = await fetch(`${BACKEND_URL}/admin/users`, {
    method: 'GET',
    headers: getAuthHeaders(accessToken),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Lấy danh sách user thất bại')
  return data
}

// ─── Get User by Id (Admin) ───────────────────────────────────────────────────
export async function getUserById(userId, accessToken) {
  const res = await fetch(`${BACKEND_URL}/admin/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(accessToken),
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
