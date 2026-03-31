// src/components/Myticker.jsx
// Luồng: GET /api/tickets → hiển thị danh sách vé + tính năng thanh toán/cập nhật trạng thái

import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Myticker.css'
import '../styles/Searchform.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (!n && n !== 0) return '—'
  return Number(n).toLocaleString('vi-VN') + '₫'
}

function parseDisplayDate(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return null

  const direct = new Date(raw)
  if (!Number.isNaN(direct.getTime())) return direct

  const slashDateTimeMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (slashDateTimeMatch) {
    const [, dd, mm, yyyy, hh = '00', min = '00', ss = '00'] = slashDateTimeMatch
    const normalized = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`)
    if (!Number.isNaN(normalized.getTime())) return normalized
  }

  return null
}

function formatDisplayDate(value) {
  const parsed = parseDisplayDate(value)
  if (!parsed) return String(value ?? '').trim()
  return parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDisplayTime(value) {
  const parsed = parseDisplayDate(value)
  if (!parsed) return ''
  return parsed.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
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

// ─── API: lấy danh sách vé ────────────────────────────────────────────────────
async function fetchTickets(page = 1) {
  const d = await apiFetch(`/tickets?page=${page}&per_page=10`, {
    method: 'GET',
  })

  const list = Array.isArray(d?.data) ? d.data : []
  const meta = d?.meta || {}

  return {
    tickets: list.map(mapTicket),
    meta,
    totalPages: meta.last_page ?? 1,
    currentPage: meta.current_page ?? page,
  }
}


// ─── API: cập nhật trạng thái thanh toán booking ──────────────────────────────
async function checkPaymentStatus(bookingId) {
  const d = await apiFetch(`/admin/booking/${bookingId}`, {
    method: 'GET',
  })
  
  const booking = d?.data ?? d
  const status = String(booking?.status ?? '').toUpperCase()
  
  return {
    status,
    isPaid: status === 'PAID',
    message: status === 'PAID' ? 'Thanh toán thành công!' : `Trạng thái: ${status}`,
    booking
  }
}

// ─── Mapper ───────────────────────────────────────────────────────────────────
function mapTicket(b) {
  if (!b) return {}
  
  // Handle new API structure
  const flightInfo = b.flight ?? {}
  const depDate = flightInfo.departure_time ? new Date(flightInfo.departure_time) : null
  const seatClass = b.seat_class ?? b.cabin_class ?? b.class ?? 'ECONOMY'
  
  return {
    id:          String(b.ticket_id ?? b.id ?? ''),
    bookingId:   String(b.booking_id ?? b.id ?? ''),
    bookingCode: b.pnr ?? b.booking_code ?? b.code ?? `Vé #${b.ticket_id ?? b.id}`,
    pnr:         b.pnr ?? '',
    airline:     'VietJet Air',
    flightNo:    b.flight_number ?? '—',
    dep:         depDate ? depDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
    arr:         '', // Not in new API
    date:        depDate ? depDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
    depCode:     flightInfo.origin ?? '',
    arrCode:     flightInfo.destination ?? '',
    depAirport:  flightInfo.origin ?? '',
    arrAirport:  flightInfo.destination ?? '',
    price:       Number(b.ticket_price ?? 0),
    class:       seatClass === 'BUSINESS' ? 'Thương gia' : seatClass === 'ECONOMY' ? 'Phổ thông' : seatClass,
    seatClass,
    logoColor:   '#1a3c6e',
    passengers:  [b.passenger_name ?? ''].filter(Boolean),
    seat:        [b.seat_number ?? ''].filter(Boolean),
    status:      (b.status ?? 'ACTIVE').toLowerCase(),
    purchasedAt: b.booked_at ? formatDisplayDate(b.booked_at) : '',
    raw:         b,
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:         { label: 'Hoạt động',        color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✓' },
  pending:        { label: 'Chờ xác nhận',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
  paid:           { label: 'Đã thanh toán',    color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '💳' },
  cancelled:      { label: 'Đã hủy',            color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '✗' },
  refunded:       { label: 'Đã hoàn tiền',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: '↩' },
  confirmed:      { label: 'Đã xác nhận',      color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✓' },
  rejected:       { label: 'Bị từ chối',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '✗' },
  used:           { label: 'Đã sử dụng',       color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: '✈' },
  checked_in:     { label: 'Đã checkin',      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '📋' },
  pending_refund: { label: 'Chờ hoàn',        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
  refunded:       { label: 'Đã hoàn',         color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '💰' },
}

const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Hoạt động' },
  { id: 'checked_in', label: 'Đã checkin' },
  { id: 'pending_refund', label: 'Chờ hoàn' },
  { id: 'refunded', label: 'Đã hoàn' },
];

// ─── Component chính ──────────────────────────────────────────────────────────

export default function MyTickets() {
  const navigate = useNavigate()

  const [tickets,  setTickets]   = useState([])
  const [filter,   setFilter]    = useState('all')
  const [loading,  setLoading]   = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [error,    setError]     = useState(null)
  const [notif,    setNotif]     = useState(null)
  const [expandId, setExpandId]  = useState(null)
  const [paymentLoading, setPaymentLoading] = useState({})

  // ── Load danh sách vé khi component mount ────────────────────────────
  const loadTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTickets(currentPage)
      setTickets(result.tickets)
      setTotalPages(result.totalPages)
      setCurrentPage(result.currentPage)
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách vé.')
      console.error('Load tickets error:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])


  // ── Cập nhật trạng thái thanh toán ───────────────────────────────────
  const handleCheckPayment = useCallback(async (bookingId, ticketId) => {
    setPaymentLoading(prev => ({ ...prev, [ticketId]: true }))
    try {
      const result = await checkPaymentStatus(bookingId)
      if (result.isPaid) {
        setNotif('✅ Thanh toán thành công!')
        // Reload tickets to get updated status
        await new Promise(r => setTimeout(r, 1000))
        loadTickets()
      } else {
        setNotif(`⏳ ${result.message}`)
      }
    } catch (err) {
      setNotif(`❌ Lỗi: ${err.message}`)
      console.error('Check payment error:', err)
    } finally {
      setPaymentLoading(prev => ({ ...prev, [ticketId]: false }))
    }
  }, [loadTickets])

  // ── Filter ──────────────────────────────────────────────────────────
  const normalizeStatus = (s) => {
    const lower = String(s).toLowerCase()
    if (lower === 'approved' || lower === 'active') return 'active'
    if (lower === 'checked_in') return 'checked_in'
    if (lower.includes('pending') || lower.includes('wait') || lower.includes('cancel_pending')) return 'pending_refund'
    if (lower.includes('refund') || lower === 'completed' || lower === 'used') return 'refunded'
    if (lower === 'pending') return 'pending'
    return lower
  }

  // Sort: non-active first, then by booked_at desc
  const sortedTickets = [...tickets].sort((a, b) => {
    const aNonActive = normalizeStatus(a.status) !== 'active'
    const bNonActive = normalizeStatus(b.status) !== 'active'
    if (aNonActive !== bNonActive) return aNonActive ? -1 : 1
    return new Date(b.raw?.booked_at || 0) - new Date(a.raw?.booked_at || 0)
  })

  const filtered = filter === 'all'
    ? sortedTickets
    : sortedTickets.filter(t => normalizeStatus(t.status) === filter)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)


  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="mt-root">

      {/* Notification Toast */}
      {notif && (
        <div className="mt-toast">
          <span>{notif.includes('✅') ? '✅' : notif.includes('❌') ? '❌' : '🔔'}</span>
          <span>{notif}</span>
          <button onClick={() => setNotif(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="mt-header">
        <div>
          <div className="mt-header__eyebrow">Quản lý vé</div>
          <div className="mt-header__title">Danh sách vé của tôi</div>
          <div className="mt-header__sub">Tìm kiếm và cập nhật trạng thái vé máy bay</div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <button
            className="mt-buy-btn"
            style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)' }}
            onClick={loadTickets}
            disabled={loading}
          >
            {loading ? '⏳ Đang tải...' : '🔄 Làm mới'}
          </button>
          <button className="mt-buy-btn1" onClick={() => navigate('/home', { state: { tab: 'muave' } })}>
            + Mua vé mới
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          padding: 16,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid #ef4444',
          borderRadius: 8,
          color: '#991b1b',
          marginBottom: 16,
          textAlign: 'center',
          fontSize: 14,
        }}>
          ⚠️ {error}
          <button onClick={loadTickets} style={{
            marginLeft: 12,
            padding: '6px 12px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}>
            Thử lại
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && tickets.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40vh',
          gap: 16,
          color: '#888',
        }}>
          <div style={{ fontSize: 32 }}>⏳</div>
          <p>Đang tải danh sách vé...</p>
        </div>
      )}

      {/* Filter tabs */}
      {!loading && tickets.length > 0 && (
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
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="mt-empty">
          <span>🎫</span>
          <p>{tickets.length === 0 ? 'Không có vé nào' : 'Không có vé nào trong danh mục này'}</p>
        </div>
      )}

      {/* Ticket list */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="mt-list">
            {filtered.map(t => {
              const sc = STATUS_CONFIG[normalizeStatus(t.status)] ?? STATUS_CONFIG.active
              const isExpanded = expandId === t.id
              const isCheckingPayment = paymentLoading[t.id]

              return (
                <div
                  key={t.id}
                  className={`mt-card${isExpanded ? ' mt-card--highlighted' : ''}`}
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
                    <div className="mt-card__time">{t.dep} · {t.class}</div>
                    <div className="mt-card__fare">Giá vé: <strong>{fmt(t.price)}</strong></div>
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

                {/* Expandable details */}
                {isExpanded && (
                  <div className="mt-card__details">
                    <div className="mt-card__details-title">
                      <span>ℹ️</span>
                      <span>Chi tiết vé</span>
                      <button className="mt-card__details-close" onClick={() => setExpandId(null)}>✕</button>
                    </div>
                    <div className="mt-card__details-grid">
                      <div className="mt-card__details-row">
                        <span className="mt-card__details-label">Mã vé:</span>
                        <span className="mt-card__details-value">{t.id}</span>
                      </div>
                      <div className="mt-card__details-row">
                        <span className="mt-card__details-label">Mã đặt chỗ:</span>
                        <span className="mt-card__details-value">{t.bookingCode}</span>
                      </div>
                      <div className="mt-card__details-row">
                        <span className="mt-card__details-label">Hành trình:</span>
                        <span className="mt-card__details-value">{t.depCode} → {t.arrCode}</span>
                      </div>
                      <div className="mt-card__details-row">
                        <span className="mt-card__details-label">Ngày:</span>
                        <span className="mt-card__details-value">{t.date}</span>
                      </div>
                      <div className="mt-card__details-row">
                        <span className="mt-card__details-label">Chuyến bay:</span>
                        <span className="mt-card__details-value">{t.flightNo}</span>
                      </div>
                      <div className="mt-card__details-row">
                        <span className="mt-card__details-label">Giờ bay:</span>
                        <span className="mt-card__details-value">{t.dep}</span>
                      </div>
                      <div className="mt-card__details-row">
                        <span className="mt-card__details-label">Hạng vé:</span>
                        <span className="mt-card__details-value">{t.class}</span>
                      </div>
                      <div className="mt-card__details-row">
                        <span className="mt-card__details-label">Trạng thái:</span>
                        <span className="mt-card__details-value" style={{ color: sc.color }}>{sc.label}</span>
                      </div>
                      <div className="mt-card__details-row">
                        <span className="mt-card__details-label">Đặt vào:</span>
                        <span className="mt-card__details-value">{t.purchasedAt}</span>
                      </div>
                      <div className="mt-card__details-row">
                        <span className="mt-card__details-label">Hành khách:</span>
                        <span className="mt-card__details-value">{t.passengers.length > 0 ? t.passengers.join(' · ') : '—'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-card__actions">
                  {/* Payment status check button for pending tickets */}
                  {normalizeStatus(t.status) === 'pending' && (
                    <button
                      className="mt-action-btn mt-action-btn--primary"
                      onClick={() => handleCheckPayment(t.bookingId, t.id)}
                      disabled={isCheckingPayment}
                    >
                      {isCheckingPayment ? '⏳ Kiểm tra...' : '💳 Cập nhật thanh toán'}
                    </button>
                  )}

                  {/* View details / Check-in buttons */}
                  {normalizeStatus(t.status) === 'active' && (
                    <>
                      <button
                        className="mt-action-btn mt-action-btn--primary"
                        onClick={() => navigate('/thu-tuc', { state: { ticketId: t.id, ticket: t } })}
                      >
                        ✅ Check-in
                      </button>
                      <button
                        className="mt-action-btn"
                        onClick={() => setExpandId(isExpanded ? null : t.id)}
                      >
                        {isExpanded ? '▲ Thu gọn' : '▼ Chi tiết'}
                      </button>
                    </>
                  )}
                  {['checked_in', 'pending_refund', 'refunded'].includes(normalizeStatus(t.status)) && (
                    <button className="mt-action-btn" disabled style={{ opacity: 0.6 }}>
                      ✓ {STATUS_CONFIG[normalizeStatus(t.status)]?.label}
                    </button>
                  )}
                  {normalizeStatus(t.status) !== 'active' && !['checked_in', 'pending_refund', 'refunded', 'pending'].includes(normalizeStatus(t.status)) && (
                    <button
                      className="mt-action-btn"
                      onClick={() => setExpandId(isExpanded ? null : t.id)}
                    >
                      {isExpanded ? '▲ Thu gọn' : '▼ Chi tiết'}
                    </button>
                  )}
                </div>

                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-pagination">
              <button
                className="mt-pagination__nav"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                ← Trước
              </button>

              {pageNumbers.map((page, idx) => (
                <div key={page} className="mt-pagination__slot">
                  {idx > 0 && pageNumbers[idx - 1] !== page - 1 && (
                    <span className="mt-pagination__dots">…</span>
                  )}
                  <button
                    className={`mt-pagination__page${page === currentPage ? ' is-active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                </div>
              ))}

              <button
                className="mt-pagination__nav"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
