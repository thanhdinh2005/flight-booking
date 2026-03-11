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