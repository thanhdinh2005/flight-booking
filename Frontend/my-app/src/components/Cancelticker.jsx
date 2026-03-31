// src/pages/CancelTicket.jsx
// Luồng: nhập PNR + Email → tìm vé → chọn vé → nhập lý do → POST /api/refund/confirm → chờ xử lý

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/CancelTicket.css'
import '../styles/Searchform.css'

// ─── API helpers ──────────────────────────────────────────────────────────────

function getToken() {
  const RAW = ['access_token', 'token', 'kc_token', 'auth_token']
  for (const k of RAW) {
    const v = sessionStorage.getItem(k)
    if (v && v.startsWith('ey')) return v
  }
  return null
}

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api'

async function apiFetch(method, path, body = null) {
  const token = getToken()
  const isGet = method === 'GET'
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Accept': 'application/json',
      ...(!isGet ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body && !isGet ? JSON.stringify(body) : null,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data?.message ?? data?.error ?? `HTTP ${res.status}`)
    err.status = res.status
    err.data   = data
    throw err
  }
  return data
}

// ─── API: tìm vé theo PNR + Email ─────────────────────────────────────────────
async function searchTickets(pnr, email) {
  const payload = {
    pnr: pnr.trim().toUpperCase(),
    email: email.trim().toLowerCase(),
  }

  const res = await apiFetch('POST', '/bookings/search-tickets', payload)

  const list = Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res)
      ? res
      : []

  if (!list.length) {
    throw new Error('Không tìm thấy vé nào với thông tin này.')
  }

  return list.map(mapTicket)
}

function normalizeTicketStatus(status) {
  const s = String(status ?? '').trim().toUpperCase()
  if (s === 'ACTIVE') return 'confirmed'
  if (s === 'PENDING') return 'pending'
  if (s === 'CANCELLED') return 'cancelled'
  if (s === 'USED') return 'used'
  return String(status ?? 'confirmed').toLowerCase()
}

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

  const passengers = Array.isArray(b.passengers)
    ? b.passengers
    : b.passenger
      ? [b.passenger]
      : Array.isArray(b.travellers)
        ? b.travellers
        : []
  const names = passengers.map(p =>
    (p.full_name ?? p.name ?? `${p.first_name ?? ''} ${p.last_name ?? ''}`).trim().toUpperCase()
  )

  const flightNo =
    fi.flight_schedule?.flight_number ??
    fi.flightSchedule?.flight_number ??
    fi.flight_number ??
    b.flight_number ??
    '—'

  const depTime       = fi.std ? new Date(fi.std) : null
  const hoursUntilDep = depTime
    ? Math.max(0, Math.round((depTime - Date.now()) / 3600000))
    : 99

  return {
    id:           String(b.id ?? ''),
    bookingCode:  b.booking_code ?? b.pnr ?? b.code ?? `BK-${b.booking_id ?? b.id}`,
    airline:      route.airline ?? fi.airline ?? 'Vietnam Airlines',
    flightNo,
    dep:          std ? std.toTimeString().slice(0,5) : (b.dep ?? ''),
    arr:          sta ? sta.toTimeString().slice(0,5) : (b.arr ?? ''),
    date:         fmtDate(depDate),
    depCode:      route.from ?? route.origin?.code ?? b.dep_code ?? '',
    arrCode:      route.to   ?? route.destination?.code ?? b.arr_code ?? '',
    depAirport:   route.from_name ?? b.dep_airport ?? '',
    arrAirport:   route.to_name   ?? b.arr_airport ?? '',
    price:        Number(b.ticket_price ?? b.total_price ?? b.amount ?? b.price ?? 0),
    class:        b.seat_class ?? b.cabin_class ?? b.class ?? 'ECONOMY',
    logoColor:    '#1a3c6e',
    passengers:   names,
    status:       normalizeTicketStatus(b.status),
    hoursUntilDep,
    raw:          b,
  }
}

const CANCEL_REASONS = [
  'Thay đổi kế hoạch cá nhân',
  'Có việc khẩn cấp / sức khoẻ',
  'Đặt nhầm ngày / chuyến',
  'Đặt trùng vé',
  'Chuyến bay bị thay đổi',
  'Lý do khác',
]

function fmt(n) { return Number(n).toLocaleString('vi-VN') + '₫' }

function validatePnr(value) {
  const pnr = String(value ?? '').trim().toUpperCase()
  if (!pnr) return 'Vui lòng nhập mã đặt chỗ.'
  if (!/^[A-Z0-9-]{6,20}$/.test(pnr)) return 'Mã đặt chỗ chỉ gồm chữ in hoa, số hoặc dấu gạch ngang và dài 6-20 ký tự.'
  return ''
}

function validateEmail(value) {
  const email = String(value ?? '').trim().toLowerCase()
  if (!email) return 'Vui lòng nhập email đặt vé.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email không đúng định dạng.'
  return ''
}

function validateRefundReason(reason, custom) {
  const selectedReason = String(reason ?? '').trim()
  const customReason = String(custom ?? '').trim()
  const finalReason = selectedReason === 'Lý do khác' ? customReason : selectedReason

  if (!selectedReason) return 'Vui lòng chọn lý do hoàn vé.'
  if (selectedReason === 'Lý do khác') {
    if (!customReason) return 'Vui lòng nhập lý do hoàn vé.'
    if (customReason.length < 10) return 'Lý do hoàn vé cần tối thiểu 10 ký tự.'
    if (customReason.length > 500) return 'Lý do hoàn vé không được vượt quá 500 ký tự.'
  }
  if (finalReason.length > 500) return 'Lý do hoàn vé không được vượt quá 500 ký tự.'
  return ''
}

// ── Step 0: Nhập PNR + Email ──────────────────────────────────────────────────
function StepSearch({ initialPnr, initialEmail, onFound }) {
  const [pnr,     setPnr]     = useState(initialPnr ?? '')
  const [email,   setEmail]   = useState(initialEmail ?? '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Nếu đã có dữ liệu từ MyTickets, tự động search
  useEffect(() => {
    if (initialPnr && initialEmail) {
      handleSearch(initialPnr, initialEmail)
    }
    // eslint-disable-next-line
  }, [])

  async function handleSearch(pnrVal, emailVal) {
    const p = (pnrVal ?? pnr).trim()
    const e = (emailVal ?? email).trim()
    const pnrError = validatePnr(p)
    if (pnrError) { setError(pnrError); return }
    const emailError = validateEmail(e)
    if (emailError) { setError(emailError); return }
    setLoading(true)
    setError('')
    try {
      const tickets = await searchTickets(p, e)
      const confirmed = tickets.filter(t => t.status === 'confirmed')
      if (confirmed.length === 0) throw new Error('Không có vé nào đủ điều kiện hoàn trong đặt chỗ này.')
      onFound(confirmed, p, e)
    } catch (err) {
      setError(err.message || 'Không tìm thấy vé. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    handleSearch()
  }

  return (
    <div className="ct-step">
      <div className="ct-step__header">
        <div className="ct-step__num">01</div>
        <div>
          <div className="ct-step__title">Tra cứu đặt chỗ</div>
          <div className="ct-step__sub">Nhập thông tin để tìm vé cần hoàn</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ct-search-form" noValidate>
        <div className="ct-search-field">
          <label className="ct-search-label">
            Mã đặt chỗ (PNR) <span className="ct-required">*</span>
          </label>
          <input
            className="ct-search-input"
            type="text"
            placeholder="VD: VB-4X9K2"
            value={pnr}
            onChange={e => { setPnr(e.target.value.toUpperCase().replace(/\s+/g, '')); setError('') }}
            disabled={loading}
            maxLength={20}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="ct-search-field">
          <label className="ct-search-label">
            Email đặt vé <span className="ct-required">*</span>
          </label>
          <input
            className="ct-search-input"
            type="email"
            placeholder="VD: ten@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value.trimStart()); setError('') }}
            disabled={loading}
            autoComplete="email"
          />
        </div>

        {error && (
          <div className="ct-search-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="ct-search-hint">
          <span>💡</span>
          <span>Mã đặt chỗ có trong email xác nhận hoặc tin nhắn SMS khi đặt vé thành công.</span>
        </div>

        <div className="ct-actions" style={{ marginTop: 24 }}>
          <button
            className="ct-btn ct-btn--primary"
            type="submit"
            disabled={loading || !!validatePnr(pnr) || !!validateEmail(email)}
          >
            {loading ? '⏳ Đang tìm...' : '🔍 Tìm vé'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Step 1 (cũ): Chọn vé ──────────────────────────────────────────────────────
function StepSelectTicket({ tickets, onSelect, onBack }) {
  return (
    <div className="ct-step">
      <div className="ct-step__header">
        <div className="ct-step__num">02</div>
        <div>
          <div className="ct-step__title">Chọn vé cần hoàn</div>
          <div className="ct-step__sub">Đã tìm thấy {tickets.length} vé đủ điều kiện hoàn, vui lòng chọn 1 vé</div>
        </div>
      </div>

      <div className="ct-search-hint" style={{ marginBottom: 16 }}>
        <span>✅</span>
        <span>Chỉ các vé còn hiệu lực và chưa khởi hành mới được hiển thị trong danh sách này.</span>
      </div>

      <div className="ct-tickets">
        {tickets.map(t => (
          <div key={t.id} className="ct-ticket-card" onClick={() => onSelect(t)}>
            <div className="ct-ticket-card__badge" style={{ background: t.logoColor }}>
              {t.airline.split(' ').map(w => w[0]).join('').slice(0,2)}
            </div>
            <div className="ct-ticket-card__main">
              <div className="ct-ticket-card__route">
                <span className="ct-ticket-card__code">{t.depCode}</span>
                <span className="ct-ticket-card__arrow">→</span>
                <span className="ct-ticket-card__code">{t.arrCode}</span>
              </div>
              <div className="ct-ticket-card__meta">
                {t.flightNo} · {t.date} · {t.dep}–{t.arr}
              </div>
              <div className="ct-ticket-card__meta">
                {(t.depCode || '---')} → {(t.arrCode || '---')} · {t.class}
              </div>
              <div className="ct-ticket-card__meta">
                {t.passengers.length ? t.passengers.join(', ') : '1 hành khách'} 
              </div>
              <div className="ct-ticket-card__pax">Đủ điều kiện hoàn · {fmt(t.price)}</div>
            </div>
            <div className="ct-ticket-card__arrow-right">›</div>
          </div>
        ))}
      </div>

      <div className="ct-actions">
        <button className="ct-btn ct-btn--ghost" onClick={onBack}>← Tìm lại</button>
      </div>
    </div>
  )
}

// ── Step 2: Preview hoàn tiền — GET /api/refund/preview/{id} ─────────────────
function StepRefundCheck({ ticket, onContinue, onBack }) {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    async function load() {
      try {
        const d = await apiFetch('GET', `/refund/preview/${ticket.id}`)
        setPreview({
          eligible:       d.eligible       ?? d.refundable    ?? true,
          fee_percent:    d.fee_percent     ?? d.penalty_pct   ?? 10,
          fee_amount:     d.fee_amount      ?? d.penalty_amount ?? Math.round(ticket.price * 0.1),
          refund_amount:  d.refund_amount   ?? d.refund        ?? Math.round(ticket.price * 0.9),
          original_price: d.original_price  ?? ticket.price,
          hours_until_dep: d.hours_until_dep ?? ticket.hoursUntilDep,
          cutoff_hours:   d.cutoff_hours    ?? 24,
          reason:         d.reason          ?? '',
        })
      } catch {
        // Fallback ước tính
        const fee = Math.round(ticket.price * 0.1)
        setPreview({
          eligible: ticket.hoursUntilDep >= 24,
          fee_percent: 10, fee_amount: fee,
          refund_amount: ticket.price - fee,
          original_price: ticket.price,
          hours_until_dep: ticket.hoursUntilDep,
          cutoff_hours: 24,
          reason: ticket.hoursUntilDep < 24 ? 'Chuyến khởi hành trong vòng 24h, không đủ điều kiện hoàn tiền.' : '',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ticket])

  return (
    <div className="ct-step">
      <div className="ct-step__header">
        <div className="ct-step__num">03</div>
        <div>
          <div className="ct-step__title">Điều kiện hoàn tiền</div>
          <div className="ct-step__sub">{ticket.flightNo} · {ticket.date}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'32px 0', color:'#888' }}>⏳ Đang kiểm tra điều kiện hoàn tiền...</div>
      ) : error ? (
        <div style={{ color:'#ef4444', marginBottom:16 }}>⚠️ {error}</div>
      ) : preview ? (
        <>
          <div className={`ct-refund-card${preview.eligible ? ' ct-refund-card--ok' : ' ct-refund-card--no'}`}>
            <div className="ct-refund-card__icon">{preview.eligible ? '✓' : '✗'}</div>
            <div className="ct-refund-card__body">
              <div className="ct-refund-card__verdict">
                {preview.eligible ? 'Đủ điều kiện hoàn tiền' : 'Không đủ điều kiện hoàn tiền'}
              </div>
              {preview.eligible ? (
                <>
                  <div className="ct-refund-card__detail">
                    Phí hoàn: <strong>{preview.fee_percent}%</strong> ({fmt(preview.fee_amount)})
                  </div>
                  <div className="ct-refund-card__amount">
                    Bạn nhận lại: <strong>{fmt(preview.refund_amount)}</strong>
                    <span className="ct-refund-card__orig"> (từ {fmt(preview.original_price)})</span>
                  </div>
                </>
              ) : (
                <div className="ct-refund-card__detail">
                  {preview.reason ?? 'Vé không hỗ trợ hoàn tiền. Bạn có thể tiếp tục nhưng sẽ không nhận lại tiền.'}
                </div>
              )}
            </div>
          </div>

          {preview.hours_until_dep !== undefined && (
            <div className="ct-timeline">
              <div className="ct-timeline__row">
                <span className="ct-timeline__label">Còn đến khởi hành</span>
                <span className="ct-timeline__value">{preview.hours_until_dep}h</span>
              </div>
              {preview.cutoff_hours && (
                <div className="ct-timeline__row">
                  <span className="ct-timeline__label">Hạn chót hoàn tiền</span>
                  <span className={`ct-timeline__value ${preview.hours_until_dep >= preview.cutoff_hours ? 'ct-ok' : 'ct-warn'}`}>
                    {preview.hours_until_dep >= preview.cutoff_hours
                      ? `✓ Còn trong thời hạn ${preview.cutoff_hours}h`
                      : `⚠ Đã qua hạn ${preview.cutoff_hours}h`}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}

      <div className="ct-actions">
        <button className="ct-btn ct-btn--ghost" onClick={onBack}>← Quay lại</button>
        <button className="ct-btn ct-btn--primary" onClick={() => onContinue(preview)} disabled={loading || !preview}>
          Tiếp tục hoàn vé →
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Nhập lý do → POST /api/refund/confirm ────────────────────────────
function StepReason({ ticket, onSubmit, onBack }) {
  const [reason,  setReason]  = useState('')
  const [custom,  setCustom]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit() {
    const finalReason = reason === 'Lý do khác' ? custom.trim() : reason
    const reasonError = validateRefundReason(reason, custom)
    if (reasonError) { setError(reasonError); return }
    setLoading(true); setError('')
    try {
      await apiFetch('POST', '/refund/confirm', {
        ticket_id: Number(ticket.id),
        reason:    finalReason,
      })
      onSubmit(finalReason)
    } catch (err) {
      setError(err.message || 'Gửi yêu cầu hoàn vé thất bại. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  const canSubmit = reason && (reason !== 'Lý do khác' || custom.trim())

  return (
    <div className="ct-step">
      <div className="ct-step__header">
        <div className="ct-step__num">04</div>
        <div>
          <div className="ct-step__title">Lý do hoàn vé</div>
          <div className="ct-step__sub">Thông tin giúp chúng tôi cải thiện dịch vụ</div>
        </div>
      </div>

      <div className="ct-summary-bar">
        <span>{ticket.depCode}→{ticket.arrCode} · {ticket.date}</span>
        <span>Vé #{ticket.id} · {ticket.flightNo}</span>
      </div>

      {error && (
        <div style={{ padding:'12px 16px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, fontSize:13, color:'#b91c1c', marginBottom:16 }}>
          ⚠️ {error}
        </div>
      )}

      <div className="ct-reasons">
        {CANCEL_REASONS.map(r => (
          <button
            key={r}
            className={`ct-reason-chip${reason === r ? ' ct-reason-chip--active' : ''}`}
            onClick={() => { setReason(r); setError('') }}
            disabled={loading}
          >
            {r}
          </button>
        ))}
      </div>

      {reason === 'Lý do khác' && (
        <textarea
          className="ct-textarea"
          placeholder="Vui lòng mô tả lý do của bạn..."
          value={custom}
          onChange={e => setCustom(e.target.value)}
          rows={3}
          maxLength={500}
          disabled={loading}
        />
      )}

      <div className="ct-actions">
        <button className="ct-btn ct-btn--ghost" onClick={onBack} disabled={loading}>← Quay lại</button>
        <button
          className={`ct-btn ct-btn--danger${!canSubmit ? ' ct-btn--disabled' : ''}`}
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? '⏳ Đang gửi...' : '🚫 Xác nhận hoàn vé'}
        </button>
      </div>
    </div>
  )
}

function StepPending({ ticket, reason, onDone, onBackToList }) {
  return (
    <div className="ct-step">
      <div className="ct-step__header">
        <div className="ct-step__num">04</div>
        <div>
          <div className="ct-step__title">Yêu cầu đang chờ xử lý</div>
          <div className="ct-step__sub">Hệ thống đã ghi nhận yêu cầu hoàn vé của bạn</div>
        </div>
      </div>

      <div className="ct-refund-card ct-refund-card--ok">
        <div className="ct-refund-card__icon">⏳</div>
        <div className="ct-refund-card__body">
          <div className="ct-refund-card__verdict">Đã gửi yêu cầu hoàn vé thành công</div>
          <div className="ct-refund-card__detail">
            Vé <strong>{ticket.flightNo}</strong> · {ticket.depCode} → {ticket.arrCode} · {ticket.date}
          </div>
          <div className="ct-refund-card__detail">
            Trạng thái hiện tại: <strong>Đang chờ xét duyệt</strong>
          </div>
          <div className="ct-refund-card__detail">
            Lý do: {reason}
          </div>
        </div>
      </div>

      <div className="ct-search-hint" style={{ marginTop: 16 }}>
        <span>ℹ️</span>
        <span>Yêu cầu của bạn sẽ được kiểm tra và cập nhật trong danh sách vé sau khi hệ thống xử lý.</span>
      </div>

      <div className="ct-actions">
        <button className="ct-btn ct-btn--ghost" onClick={onBackToList}>← Hoàn vé khác</button>
        <button className="ct-btn ct-btn--primary" onClick={onDone}>Xem vé của tôi →</button>
      </div>
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function CancelTicket() {
  const navigate = useNavigate()
  const location = useLocation()

  // Nếu MyTickets truyền ticket + pnr + email → bỏ qua bước 0 & 1
  const passedTicket = location.state?.ticket ?? null
  const passedPnr    = location.state?.pnr    ?? ''
  const passedEmail  = location.state?.email  ?? ''

  // step: 0=search, 1=select, 2=reason, 3=pending
  const [step,    setStep]    = useState(passedTicket ? 2 : 0)
  const [tickets, setTickets] = useState(passedTicket ? [passedTicket] : [])
  const [ticket,  setTicket]  = useState(passedTicket)
  const [searchCtx, setSearchCtx] = useState({ pnr: passedPnr, email: passedEmail })
  const [submittedReason, setSubmittedReason] = useState('')

  // Progress labels tương ứng từng bước
  const STEPS = ['Tra cứu', 'Chọn vé', 'Lý do hoàn', 'Chờ xử lý']

  function handleFound(foundTickets, pnr, email) {
    if (!getToken()) {
      alert('Vui lòng đăng nhập để tiếp tục hoàn vé.')
      navigate('/login', {
        state: {
          redirectTo: '/cancel-ticket',
          pnr,
          email,
        }
      })
      return
    }

    setTickets(foundTickets)
    setSearchCtx({ pnr, email })
    setTicket(null)
    setStep(1)
  }

  function handleSubmit(reason) {
    setSubmittedReason(reason)
    setStep(3)
  }

  return (
    <div className="ct-root">
      {/* Progress steps */}
      <div className="ct-progress">
        {STEPS.map((s, i) => (
          <div key={s} className={`ct-progress__step${step > i ? ' done' : ''}${step === i ? ' active' : ''}`}>
            <div className="ct-progress__dot">{step > i ? '✓' : i + 1}</div>
            <span>{s}</span>
            {i < STEPS.length - 1 && <div className="ct-progress__line" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <StepSearch
          initialPnr={passedPnr}
          initialEmail={passedEmail}
          onFound={handleFound}
        />
      )}
      {step === 1 && (
        <StepSelectTicket
          tickets={tickets}
          onBack={() => setStep(0)}
          onSelect={t => { setTicket(t); setStep(2) }}
        />
      )}
      {step === 2 && ticket && (
        <StepReason
          ticket={ticket}
          onSubmit={handleSubmit}
          onBack={() => setStep(tickets.length > 1 ? 1 : 0)}
        />
      )}
      {step === 3 && ticket && (
        <StepPending
          ticket={ticket}
          reason={submittedReason}
          onBackToList={() => {
            setSubmittedReason('')
            setTicket(null)
            setStep(0)
          }}
          onDone={() => {
            navigate('/my-tickets', {
              state: {
                notification: `Yêu cầu hoàn vé ${ticket.flightNo} đã được gửi. Lý do: ${submittedReason}. Đang chờ xét duyệt.`,
                highlightId:  ticket.id,
                newStatus:    'cancel_pending',
              }
            })
          }}
        />
      )}
    </div>
  )
}
