// src/pages/MyTickets.jsx
import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/Myticker.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (!n && n !== 0) return '—'
  return Number(n).toLocaleString('vi-VN') + '₫'
}

function getToken() {
  const RAW = ['access_token', 'token', 'kc_token', 'auth_token']
  for (const k of RAW) {
    const v = localStorage.getItem(k) ?? sessionStorage.getItem(k)
    if (v && v.startsWith('ey')) return v
  }
  try {
    const JSON_KEYS = ['kc_auth', 'keycloak', 'auth', 'user', 'session']
    for (const k of JSON_KEYS) {
      const raw = localStorage.getItem(k) ?? sessionStorage.getItem(k)
      if (!raw) continue
      const p = JSON.parse(raw)
      const t = p?.access_token ?? p?.token ?? null
      if (t && t.startsWith('ey')) return t
    }
  } catch {}
  return null
}

async function apiFetch(path) {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message ?? data?.error ?? `HTTP ${res.status}`)
  return data
}

// ─── API: lấy vé của user hiện tại ───────────────────────────────────────────
// GET /api/my-tickets  hoặc  /api/bookings/my
async function getMyTickets() {
  try {
    const d = await apiFetch('/my-tickets')
    const list = Array.isArray(d) ? d : (d?.data ?? d?.tickets ?? d?.bookings ?? [])
    return list.map(mapTicket)
  } catch {
    // Fallback thử endpoint khác
    const d = await apiFetch('/bookings/my')
    const list = Array.isArray(d) ? d : (d?.data ?? [])
    return list.map(mapTicket)
  }
}

// ─── API: lọc flight instances (dùng cho check-in / đổi chuyến) ──────────────
// GET /api/admin/flight-instances/filter?status=SCHEDULED&from_date=&to_date=&page=
export async function getScheduledFlights({ status = 'SCHEDULED', from_date = '', to_date = '', page = 1, per_page = 20 } = {}) {
  const p = new URLSearchParams({ status, page: String(page), per_page: String(per_page) })
  if (from_date) p.set('from_date', from_date)
  if (to_date)   p.set('to_date',   to_date)
  const d    = await apiFetch(`/admin/flight-instances/filter?${p.toString()}`)
  const list = Array.isArray(d) ? d : (d?.data ?? [])
  const meta = d?.meta ?? d?.pagination ?? { total: list.length, last_page: 1, current_page: page }
  return { data: list, meta }
}

// ─── Mapper: backend booking → frontend ticket ────────────────────────────────
function mapTicket(b) {
  if (!b) return {}
  const fi      = b.flight_instance ?? b.flightInstance ?? {}
  const route   = fi.route ?? {}
  const std     = fi.std  ? new Date(fi.std)  : null
  const sta     = fi.sta  ? new Date(fi.sta)  : null
  const depDate = fi.departure_date ?? fi.date ?? b.departure_date ?? ''

  // Format date dd/mm/yyyy
  const fmtDate = (raw) => {
    if (!raw) return ''
    const d = new Date(raw)
    if (isNaN(d)) return raw
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  }

  const passengers = b.passengers ?? b.travellers ?? []
  const passengerNames = passengers.map(p =>
    (p.full_name ?? p.name ?? `${p.first_name ?? ''} ${p.last_name ?? ''}`).trim().toUpperCase()
  )
  const seats = passengers.map(p => p.seat ?? p.seat_number ?? '')

  return {
    id:          String(b.id ?? ''),
    bookingCode: b.booking_code ?? b.code ?? `BK-${b.id}`,
    airline:     route.airline  ?? fi.airline ?? 'VietJext',
    flightNo:    fi.flight_number ?? b.flight_number ?? '—',
    dep:         std ? std.toTimeString().slice(0,5) : (b.dep ?? ''),
    arr:         sta ? sta.toTimeString().slice(0,5) : (b.arr ?? ''),
    date:        fmtDate(depDate),
    depCode:     route.from   ?? b.dep_code ?? '',
    arrCode:     route.to     ?? b.arr_code ?? '',
    depAirport:  route.from_name ?? b.dep_airport ?? '',
    arrAirport:  route.to_name   ?? b.arr_airport  ?? '',
    price:       Number(b.total_price ?? b.amount ?? b.price ?? 0),
    class:       b.cabin_class ?? b.class ?? 'Phổ thông',
    logoColor:   '#1a3c6e',
    passengers:  passengerNames.length ? passengerNames : (b.passenger_names ?? []),
    seat:        seats,
    status:      (b.status ?? 'confirmed').toLowerCase(),
    purchasedAt: fmtDate(b.created_at ?? b.purchased_at ?? ''),
    raw:         b,
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_TICKETS = [
  {
    id: 'BK001', bookingCode: 'VB-4X9K2',
    airline: 'Vietnam Airlines', flightNo: 'VN-201',
    dep: '07:00', arr: '09:10', date: '20/04/2026',
    depCode: 'HAN', arrCode: 'SGN',
    depAirport: 'Nội Bài', arrAirport: 'Tân Sơn Nhất',
    price: 2500000, class: 'Phổ thông', logoColor: '#1a3c6e',
    passengers: ['NGUYEN VAN AN', 'TRAN THI BINH'], seat: ['14A', '14B'],
    status: 'confirmed', purchasedAt: '10/03/2026',
  },
  {
    id: 'BK002', bookingCode: 'VB-4X9K2',
    airline: 'VietJet Air', flightNo: 'VJ-156',
    dep: '20:00', arr: '22:10', date: '28/04/2026',
    depCode: 'SGN', arrCode: 'HAN',
    depAirport: 'Tân Sơn Nhất', arrAirport: 'Nội Bài',
    price: 1780000, class: 'Phổ thông', logoColor: '#e5002b',
    passengers: ['NGUYEN VAN AN', 'TRAN THI BINH'], seat: ['7C', '7D'],
    status: 'confirmed', purchasedAt: '10/03/2026',
  },
  {
    id: 'BK003', bookingCode: 'VB-7M2P1',
    airline: 'Bamboo Airways', flightNo: 'QH-401',
    dep: '13:15', arr: '15:25', date: '15/05/2026',
    depCode: 'HAN', arrCode: 'DAD',
    depAirport: 'Nội Bài', arrAirport: 'Đà Nẵng',
    price: 1050000, class: 'Phổ thông', logoColor: '#00863d',
    passengers: ['NGUYEN VAN AN'], seat: ['22F'],
    status: 'confirmed', purchasedAt: '12/03/2026',
  },
]

const STATUS_CONFIG = {
  confirmed:      { label: 'Đã xác nhận',      color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✓' },
  cancel_pending: { label: 'Chờ duyệt hủy',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
  change_pending: { label: 'Chờ xác nhận đổi', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '🔄' },
  cancelled:      { label: 'Đã hủy',            color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '✗' },
  changed:        { label: 'Đã đổi chuyến',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: '↗' },
  // Alias từ backend
  approved:       { label: 'Đã xác nhận',      color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✓' },
  pending:        { label: 'Chờ xác nhận',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
  rejected:       { label: 'Bị từ chối',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '✗' },
}

const FILTER_TABS = [
  { id: 'all',            label: 'Tất cả' },
  { id: 'confirmed',      label: 'Xác nhận' },
  { id: 'cancel_pending', label: 'Chờ hủy' },
  { id: 'change_pending', label: 'Chờ đổi' },
  { id: 'cancelled',      label: 'Đã hủy' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyTickets() {
  const location = useLocation()
  const navigate = useNavigate()

  const [tickets,   setTickets]   = useState(INITIAL_TICKETS)
  const [filter,    setFilter]    = useState('all')
  const [notif,     setNotif]     = useState(null)
  const [expandId,  setExpandId]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  // ── Fetch vé của user ───────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyTickets()
      // Nếu API trả về dữ liệu hợp lệ thì dùng, ngược lại giữ mock
      if (Array.isArray(data) && data.length > 0) {
        setTickets(data)
      }
    } catch (err) {
      console.error('[MyTickets] fetchTickets lỗi:', err.message)
      // Không hiển thị lỗi cho user — fallback sang mock data
      // setError('Không tải được danh sách vé: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTickets() }, [])

  // ── Nhận state từ CancelTicket / ChangeFlight ───────────────────────────
  useEffect(() => {
    const state = location.state
    if (!state) return

    if (state.notification) {
      setNotif(state.notification)
      setTimeout(() => setNotif(null), 5000)
    }
    if (state.highlightId && state.newStatus) {
      setTickets(prev => prev.map(t =>
        t.id === state.highlightId ? { ...t, status: state.newStatus } : t
      ))
      setExpandId(state.highlightId)
    }
    window.history.replaceState({}, '')
  }, [location.state])

  // ── Filter ──────────────────────────────────────────────────────────────
  const normalizeStatus = (s) => {
    if (s === 'approved') return 'confirmed'
    if (s === 'pending')  return 'cancel_pending'
    return s
  }

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter(t => normalizeStatus(t.status) === filter)

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="mt-root">

      {/* Toast */}
      {notif && (
        <div className="mt-toast">
          <span>🔔</span>
          <span>{notif}</span>
          <button onClick={() => setNotif(null)}>✕</button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ margin: '0 0 16px', padding: '12px 16px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, fontSize: 14, color: '#ef4444', display: 'flex', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="mt-header">
        <div>
          <div className="mt-header__eyebrow">Tài khoản của tôi</div>
          <div className="mt-header__title">Vé đã đặt</div>
          <div className="mt-header__sub">
            {loading
              ? '⏳ Đang tải...'
              : `${tickets.length} chuyến bay · cập nhật realtime`
            }
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="mt-buy-btn"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={fetchTickets}
            disabled={loading}
          >
            {loading ? '⏳' : '🔄'} Làm mới
          </button>
          <button className="mt-buy-btn" onClick={() => navigate('/buy-ticket')}>
            + Mua vé mới
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-filters">
        {FILTER_TABS.map(f => (
          <button
            key={f.id}
            className={`mt-filter-tab${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="mt-filter-count">
              {f.id === 'all'
                ? tickets.length
                : tickets.filter(t => normalizeStatus(t.status) === f.id).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && tickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 15 }}>
          ✈️ Đang tải danh sách vé...
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="mt-empty">
          <span>🎫</span>
          <p>Không có vé nào trong danh mục này</p>
        </div>
      )}

      {/* Ticket list */}
      {filtered.length > 0 && (
        <div className="mt-list">
          {filtered.map(t => {
            const sc         = STATUS_CONFIG[normalizeStatus(t.status)] ?? STATUS_CONFIG.confirmed
            const isExpanded = expandId === t.id

            return (
              <div
                key={t.id}
                className={`mt-card${isExpanded ? ' mt-card--highlight' : ''}`}
                style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}
              >
                {/* Status bar */}
                <div className="mt-card__status-bar" style={{ background: sc.color }} />

                <div className="mt-card__main">
                  {/* Airline badge */}
                  <div className="mt-card__badge" style={{ background: t.logoColor }}>
                    {t.airline.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  {/* Route */}
                  <div className="mt-card__route">
                    <span className="mt-card__iata">{t.depCode}</span>
                    <div className="mt-card__route-mid">
                      <div className="mt-card__route-line" />
                      <span className="mt-card__route-plane">✈</span>
                    </div>
                    <span className="mt-card__iata">{t.arrCode}</span>
                  </div>

                  {/* Info */}
                  <div className="mt-card__info">
                    <div className="mt-card__flight">{t.flightNo} · {t.date}</div>
                    <div className="mt-card__time">{t.dep} – {t.arr} · {t.class}</div>
                    <div className="mt-card__pax">
                      {t.passengers.length > 0
                        ? t.passengers.map((p, i) => (
                            <span key={i}>{p}{t.seat?.[i] ? ` (${t.seat[i]})` : ''}</span>
                          )).reduce((a, b, i) => [a, <span key={`sep-${i}`}> · </span>, b])
                        : <span style={{ color: '#aaa' }}>—</span>
                      }
                    </div>
                  </div>

                  {/* Price + Status */}
                  <div className="mt-card__right">
                    <div className="mt-card__price">{fmt(t.price)}</div>
                    <div
                      className="mt-card__status-badge"
                      style={{ color: sc.color, background: sc.bg }}
                    >
                      <span>{sc.icon}</span>
                      <span>{sc.label}</span>
                    </div>
                    <div className="mt-card__booking-code">{t.bookingCode}</div>
                  </div>
                </div>

                {/* Pending notice */}
                {isExpanded && (t.status === 'cancel_pending' || t.status === 'change_pending') && (
                  <div className="mt-card__pending-notice" style={{ borderColor: sc.color }}>
                    <span style={{ color: sc.color }}>{sc.icon}</span>
                    <div>
                      <strong style={{ color: sc.color }}>{sc.label}</strong>
                      <p>
                        {t.status === 'cancel_pending'
                          ? 'Yêu cầu hủy vé đã được ghi nhận. Chúng tôi sẽ phản hồi trong vòng 24–48 giờ làm việc.'
                          : 'Yêu cầu đổi chuyến đã được ghi nhận. Chúng tôi sẽ xác nhận trong vòng 2–4 giờ.'
                        }
                      </p>
                    </div>
                    <button className="mt-dismiss" onClick={() => setExpandId(null)}>✕</button>
                  </div>
                )}

                {/* Actions */}
                {normalizeStatus(t.status) === 'confirmed' && (
                  <div className="mt-card__actions">
                    <button
                      className="mt-action-btn"
                      onClick={() => navigate('/cancel-ticket', { state: { ticketId: t.id, ticket: t } })}
                    >
                      🚫 Hủy vé
                    </button>
                    <button
                      className="mt-action-btn"
                      onClick={() => navigate('/change-flight', { state: { ticketId: t.id, ticket: t } })}
                    >
                      🔄 Đổi chuyến
                    </button>
                    <button
                      className="mt-action-btn mt-action-btn--primary"
                      onClick={() => navigate('/thu-tuc', { state: { ticketId: t.id, ticket: t } })}
                    >
                      ✅ Check-in
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}