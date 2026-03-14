// src/pages/MyTickets.jsx
// Hiển thị danh sách vé đã mua + tình trạng: confirmed / cancel_pending / change_pending / cancelled / changed
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/Myticker.css'

const INITIAL_TICKETS = [
  {
    id: 'BK001', bookingCode: 'VB-4X9K2',
    airline: 'Vietnam Airlines', flightNo: 'VN-201',
    dep: '07:00', arr: '09:10', date: '20/04/2026',
    depCode: 'HAN', arrCode: 'SGN',
    depAirport: 'Nội Bài', arrAirport: 'Tân Sơn Nhất',
    price: 2500000, class: 'Phổ thông',
    logoColor: '#1a3c6e',
    passengers: ['NGUYEN VAN AN', 'TRAN THI BINH'],
    seat: ['14A', '14B'],
    status: 'confirmed',
    purchasedAt: '10/03/2026',
  },
  {
    id: 'BK002', bookingCode: 'VB-4X9K2',
    airline: 'VietJet Air', flightNo: 'VJ-156',
    dep: '20:00', arr: '22:10', date: '28/04/2026',
    depCode: 'SGN', arrCode: 'HAN',
    depAirport: 'Tân Sơn Nhất', arrAirport: 'Nội Bài',
    price: 1780000, class: 'Phổ thông',
    logoColor: '#e5002b',
    passengers: ['NGUYEN VAN AN', 'TRAN THI BINH'],
    seat: ['7C', '7D'],
    status: 'confirmed',
    purchasedAt: '10/03/2026',
  },
  {
    id: 'BK003', bookingCode: 'VB-7M2P1',
    airline: 'Bamboo Airways', flightNo: 'QH-401',
    dep: '13:15', arr: '15:25', date: '15/05/2026',
    depCode: 'HAN', arrCode: 'DAD',
    depAirport: 'Nội Bài', arrAirport: 'Đà Nẵng',
    price: 1050000, class: 'Phổ thông',
    logoColor: '#00863d',
    passengers: ['NGUYEN VAN AN'],
    seat: ['22F'],
    status: 'confirmed',
    purchasedAt: '12/03/2026',
  },
]

const STATUS_CONFIG = {
  confirmed:      { label: 'Đã xác nhận',       color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✓' },
  cancel_pending: { label: 'Chờ duyệt hủy',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
  change_pending: { label: 'Chờ xác nhận đổi',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '🔄' },
  cancelled:      { label: 'Đã hủy',             color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '✗' },
  changed:        { label: 'Đã đổi chuyến',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: '↗' },
}

function fmt(n) { return n.toLocaleString('vi-VN') + '₫' }

const FILTER_TABS = [
  { id: 'all',            label: 'Tất cả' },
  { id: 'confirmed',      label: 'Xác nhận' },
  { id: 'cancel_pending', label: 'Chờ hủy' },
  { id: 'change_pending', label: 'Chờ đổi' },
  { id: 'cancelled',      label: 'Đã hủy' },
]

export default function MyTickets() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tickets,   setTickets]   = useState(INITIAL_TICKETS)
  const [filter,    setFilter]    = useState('all')
  const [notif,     setNotif]     = useState(null)
  const [expandId,  setExpandId]  = useState(null)

  // Nhận state từ CancelTicket hoặc ChangeFlight
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
    // Xóa state để không lặp lại khi reload
    window.history.replaceState({}, '')
  }, [location.state])

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)

  return (
    <div className="mt-root">

      {/* Toast notification */}
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
          <div className="mt-header__eyebrow">Tài khoản của tôi</div>
          <div className="mt-header__title">Vé đã đặt</div>
          <div className="mt-header__sub">{tickets.length} chuyến bay · cập nhật realtime</div>
        </div>
        <button className="mt-buy-btn" onClick={() => navigate('/buy-ticket')}>
          + Mua vé mới
        </button>
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
              {f.id === 'all' ? tickets.length : tickets.filter(t => t.status === f.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div className="mt-empty">
          <span>🎫</span>
          <p>Không có vé nào trong danh mục này</p>
        </div>
      ) : (
        <div className="mt-list">
          {filtered.map(t => {
            const sc = STATUS_CONFIG[t.status] || STATUS_CONFIG.confirmed
            const isExpanded = expandId === t.id
            return (
              <div
                key={t.id}
                className={`mt-card${isExpanded ? ' mt-card--highlight' : ''}`}
              >
                {/* Status bar at top */}
                <div className="mt-card__status-bar" style={{ background: sc.color }} />

                <div className="mt-card__main">
                  {/* Airline badge */}
                  <div className="mt-card__badge" style={{ background: t.logoColor }}>
                    {t.airline.split(' ').map(w => w[0]).join('').slice(0,2)}
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
                      {t.passengers.map((p, i) => (
                        <span key={p}>{p}{t.seat[i] ? ` (${t.seat[i]})` : ''}</span>
                      )).reduce((a, b) => [a, ' · ', b])}
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

                {/* Expanded detail for pending states */}
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

                {/* Quick actions */}
                {t.status === 'confirmed' && (
                  <div className="mt-card__actions">
                    <button className="mt-action-btn" onClick={() => navigate('/cancel-ticket')}>🚫 Hủy vé</button>
                    <button className="mt-action-btn" onClick={() => navigate('/change-flight')}>🔄 Đổi chuyến</button>
                    <button className="mt-action-btn mt-action-btn--primary" onClick={() => navigate('/checkin')}>✅ Check-in</button>
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