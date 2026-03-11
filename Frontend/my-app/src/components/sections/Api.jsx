/* ─────────────────────────────────────────
   API helpers — cùng pattern với Login.jsx
───────────────────────────────────────── */
const BASE = 'http://backend.test/api'

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('kc_token'))?.access_token || null
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

const api = {
  /* USER */
  searchUser:   (email) => apiFetch('GET', `/admin/users/search?email=${encodeURIComponent(email)}`),
  getAllUsers:   ()      => apiFetch('GET', '/admin/users'),
  getUserById:  (id)    => apiFetch('GET', `/admin/users/${id}`),
  createUser:   (body)  => apiFetch('POST','/admin/users', body),
  disableUser:  (id)    => apiFetch('PUT', `/admin/users/${id}/disable`),
  activateUser: (id)    => apiFetch('PUT', `/admin/users/${id}/active`),

  /* FLIGHT */
  getAllFlights:   ()     => apiFetch('GET',  '/admin/flights'),
  createFlight:   (body) => apiFetch('POST', '/admin/flights', body),

  /* SCHEDULE */
  getAllSchedules:     ()     => apiFetch('GET',  '/admin/schedules'),
  createSchedule:     (body) => apiFetch('POST', '/admin/schedules', body),
  reactivateSchedule: (id)   => apiFetch('PUT',  `/admin/schedules/${id}/reactivate`),
  phaseOutSchedule:   (id)   => apiFetch('PUT',  `/admin/schedules/${id}/phase-out`),

  /* REFUND / BOOKING */
  getNewRequests:  ()     => apiFetch('GET',  '/requests'),
  createRefund:    (body) => apiFetch('POST', '/refund-requests', body),
  approveRefund:   (id)   => apiFetch('POST', `/refund-requests/${id}/approve`),
  rejectBooking:   (id)   => apiFetch('POST', `/booking-requests/${id}/reject`),
}

export default api