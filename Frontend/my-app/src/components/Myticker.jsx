// src/pages/MyTickets.jsx
// Luồng: nhập PNR + Email → GET /api/bookings/search-tickets → hiển thị vé

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Myticker.css'
import '../styles/Searchform.css'

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

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api'

async function apiFetch(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message ?? data?.error ?? `HTTP ${res.status}`)
  return data
}

// ─── API: tìm vé theo PNR + Email ─────────────────────────────────────────────
async function searchTickets(pnr, email) {
  const params = new URLSearchParams({ pnr: pnr.trim().toUpperCase(), email: email.trim().toLowerCase() })
  const d = await apiFetch(`/bookings/search-tickets?${params}`)
  const list = Array.isArray(d) ? d : (d?.data ?? d?.tickets ?? d?.bookings ?? [])
  return list.map(mapTicket)
}

// ─── Mapper ───────────────────────────────────────────────────────────────────
function mapTicket(b) {
  if (!b) return {}
  const fi      = b.flight_instance ?? b.flightInstance ?? {}
  const route   = fi.route ?? {}
  const std     = fi.std ? new Date(fi.std) : null
  const sta     = fi.sta ? new Date(fi.sta) : null
  const depDate = fi.departure_date ?? fi.date ?? b.departure_date ?? ''

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
    bookingCode: b.booking_code ?? b.pnr ?? b.code ?? `BK-${b.id}`,
    airline:     route.airline  ?? fi.airline ?? 'VietJett',
    flightNo:    fi.flight_number ?? b.flight_number ?? '—',
    dep:         std ? std.toTimeString().slice(0,5) : (b.dep ?? ''),
    arr:         sta ? sta.toTimeString().slice(0,5) : (b.arr ?? ''),
    date:        fmtDate(depDate),
    depCode:     route.from      ?? route.origin?.code ?? b.dep_code ?? '',
    arrCode:     route.to        ?? route.destination?.code ?? b.arr_code ?? '',
    depAirport:  route.from_name ?? route.origin?.name ?? b.dep_airport ?? '',
    arrAirport:  route.to_name   ?? route.destination?.name ?? b.arr_airport ?? '',
    price:       Number(b.total_price ?? b.amount ?? b.price ?? 0),
    class:       b.cabin_class  ?? b.class ?? 'Phổ thông',
    logoColor:   '#1a3c6e',
    passengers:  passengerNames.length ? passengerNames : (b.passenger_names ?? []),
    seat:        seats,
    status:      (b.status ?? 'confirmed').toLowerCase(),
    purchasedAt: fmtDate(b.created_at ?? b.purchased_at ?? ''),
    raw:         b,
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  confirmed:      { label: 'Đã xác nhận',      color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✓' },
  cancel_pending: { label: 'Chờ duyệt hủy',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
  change_pending: { label: 'Chờ xác nhận đổi', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '🔄' },
  cancelled:      { label: 'Đã hủy',            color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '✗' },
  changed:        { label: 'Đã đổi chuyến',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: '↗' },
  approved:       { label: 'Đã xác nhận',      color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✓' },
  pending:        { label: 'Chờ xác nhận',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
  rejected:       { label: 'Bị từ chối',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '✗' },
  used:           { label: 'Đã sử dụng',       color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: '✈' },
}

const FILTER_TABS = [
  { id: 'all',            label: 'Tất cả' },
  { id: 'confirmed',      label: 'Xác nhận' },
  { id: 'cancel_pending', label: 'Chờ hủy' },
  { id: 'change_pending', label: 'Chờ đổi' },
  { id: 'cancelled',      label: 'Đã hủy' },
]

// ─── Search Form ──────────────────────────────────────────────────────────────

function SearchForm({ onSearch }) {
  const [pnr,     setPnr]     = useState('')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pnr.trim() || !email.trim()) {
      setError('Vui lòng nhập đầy đủ mã đặt chỗ và email.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const tickets = await searchTickets(pnr, email)
      onSearch(tickets, pnr.trim().toUpperCase(), email.trim().toLowerCase())
    } catch (err) {
      setError(err.message || 'Không tìm thấy vé. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-search-wrap">
      <div className="mt-search-card">
        {/* Icon */}
        <div className="mt-search-icon">🎫</div>

        <h2 className="mt-search-title">Tra cứu vé của bạn</h2>
        <p className="mt-search-desc">
          Nhập mã đặt chỗ (PNR) và địa chỉ email để xem tình trạng vé hoặc thực hiện hoàn vé.
        </p>

        <form onSubmit={handleSubmit} className="mt-search-form" noValidate>
          <div className="mt-search-field">
            <label className="mt-search-label">
              Mã đặt chỗ (PNR)
              <span className="mt-search-required">*</span>
            </label>
            <input
              className="mt-search-input"
              type="text"
              placeholder="VD: VB-4X9K2"
              value={pnr}
              onChange={e => { setPnr(e.target.value.toUpperCase()); setError('') }}
              disabled={loading}
              maxLength={20}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="mt-search-field">
            <label className="mt-search-label">
              Email đặt vé
              <span className="mt-search-required">*</span>
            </label>
            <input
              className="mt-search-input"
              type="email"
              placeholder="VD: ten@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {error && (
            <div className="mt-search-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            className="mt-search-btn"
            type="submit"
            disabled={loading || !pnr.trim() || !email.trim()}
          >
            {loading ? '⏳ Đang tìm kiếm...' : '🔍 Tìm vé'}
          </button>
        </form>

        <div className="mt-search-hint">
          <span>💡</span>
          <span>Mã đặt chỗ có trong email xác nhận hoặc tin nhắn khi đặt vé thành công.</span>
        </div>
      </div>
    </div>
  )
}

// ─── Component chính ──────────────────────────────────────────────────────────

export default function MyTickets() {
  const navigate = useNavigate()

  const [phase,    setPhase]    = useState('search')   // 'search' | 'result'
  const [tickets,  setTickets]  = useState([])
  const [filter,   setFilter]   = useState('all')
  const [notif,    setNotif]    = useState(null)
  const [expandId, setExpandId] = useState(null)
  const [searchCtx, setSearchCtx] = useState({ pnr: '', email: '' })

  // ── Nhận kết quả tìm kiếm ────────────────────────────────────────────
  function handleSearch(data, pnr, email) {
    setTickets(data)
    setSearchCtx({ pnr, email })
    setFilter('all')
    setPhase('result')
  }

  // ── Tìm lại ──────────────────────────────────────────────────────────
  function handleReset() {
    setPhase('search')
    setTickets([])
    setNotif(null)
    setExpandId(null)
  }

  // ── Làm mới (search lại với cùng PNR+email) ───────────────────────────
  const handleRefresh = useCallback(async () => {
    if (!searchCtx.pnr || !searchCtx.email) return
    try {
      const data = await searchTickets(searchCtx.pnr, searchCtx.email)
      setTickets(data)
    } catch (err) {
      setNotif('Không thể làm mới: ' + err.message)
    }
  }, [searchCtx])

  // ── Filter ──────────────────────────────────────────────────────────
  const normalizeStatus = (s) => {
    if (s === 'approved') return 'confirmed'
    if (s === 'pending')  return 'cancel_pending'
    return s
  }

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter(t => normalizeStatus(t.status) === filter)

  // ── Render: Search Phase ──────────────────────────────────────────────
  if (phase === 'search') {
    return (
      <div className="mt-root">
        <div className="mt-header">
          <div>
            <div className="mt-header__eyebrow">Quản lý đặt chỗ</div>
            <div className="mt-header__title">Vé của tôi</div>
            <div className="mt-header__sub">Tra cứu và quản lý vé máy bay</div>
          </div>
          <button className="mt-buy-btn1" onClick={() => navigate('/home', { state: { tab: 'muave' } })}>
            + Mua vé mới
          </button>
        </div>

        <SearchForm onSearch={handleSearch} />
      </div>
    )
  }

  // ── Render: Result Phase ──────────────────────────────────────────────
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

      {/* Header */}
      <div className="mt-header">
        <div>
          <div className="mt-header__eyebrow">Mã đặt chỗ: {searchCtx.pnr}</div>
          <div className="mt-header__title">Vé đã đặt</div>
          <div className="mt-header__sub">
            {tickets.length} chuyến bay · {searchCtx.email}
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <button
            className="mt-buy-btn"
            style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)' }}
            onClick={handleReset}
          >
            🔍 Tìm lại
          </button>
          <button
            className="mt-buy-btn"
            style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)' }}
            onClick={handleRefresh}
          >
            🔄 Làm mới
          </button>
          <button className="mt-buy-btn1" onClick={() => navigate('/home', { state: { tab: 'muave' } })}>
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

      {/* Empty state */}
      {filtered.length === 0 && (
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
                        : <span style={{ color:'#aaa' }}>—</span>
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
                      onClick={() => navigate('/cancel-ticket', {
                        state: {
                          ticketId: t.id,
                          ticket:   t,
                          pnr:      searchCtx.pnr,
                          email:    searchCtx.email,
                        }
                      })}
                    >
                      🚫 Hủy vé
                    </button>
                    <button
                      className="mt-action-btn mt-action-btn--primary"
                      onClick={() => navigate('/thu-tuc', { state: { ticketId: t.id, ticket: t } })}
                    >
                      ✅ Check-in
                    </button>
                  </div>
                )}

                {/* Xem chi tiết nếu cancel_pending / change_pending */}
                {(normalizeStatus(t.status) === 'cancel_pending' || normalizeStatus(t.status) === 'change_pending') && (
                  <div className="mt-card__actions">
                    <button
                      className="mt-action-btn"
                      onClick={() => setExpandId(isExpanded ? null : t.id)}
                    >
                      {isExpanded ? '▲ Thu gọn' : '▼ Xem trạng thái'}
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