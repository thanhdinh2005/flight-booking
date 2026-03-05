const KEYCLOAK_URL = 'http://localhost:8080'
const REALM = 'flight-booking-realm'
const CLIENT_ID = 'frontend-client'

const TOKEN_URL = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`

// Đăng nhập → trả về access_token
export async function loginKeycloak(email, password) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: CLIENT_ID,
      username: email,
      password: password,
    }),
  })
  if (!res.ok) throw new Error('Sai email hoặc mật khẩu')
  return res.json()
}

// Đăng ký qua backend Laravel
export async function registerUser(payload) {
  const res = await fetch('http://backend.test/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Đăng ký thất bại')
  }
  return res.json()
}

export function saveToken(tokenData) {
  localStorage.setItem('access_token', tokenData.access_token)
  localStorage.setItem('refresh_token', tokenData.refresh_token)
}

export function getToken() {
  return localStorage.getItem('access_token')
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}