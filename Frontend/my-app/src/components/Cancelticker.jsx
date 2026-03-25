// src/pages/CancelTicket.jsx
// Luồng: nhập PNR + Email → tìm vé → GET /api/refund/preview/{id} → nhập lý do → POST /api/refund/confirm

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/CancelTicket.css'
import '../styles/Searchform.css'

// ─── API helpers ──────────────────────────────────────────────────────────────

function getToken() {
  const RAW = ['access_token', 'token', 'kc_token', 'auth_token']
  for (const k of RAW) {
    const v = localStorage.getItem(k) ?? sessionStorage.getItem(k)
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
  const params = new URLSearchParams({ pnr: pnr.trim().toUpperCase(), email: email.trim().toLowerCase() })
  const d = await apiFetch('GET', `/bookings/search-tickets?${params}`)
  const list = Array.isArray(d) ? d : (d?.data ?? d?.tickets ?? d?.bookings ?? [])
  return list.map(mapTicket)
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

  const passengers = b.passengers ?? b.travellers ?? []
  const names = passengers.map(p =>
    (p.full_name ?? p.name ?? `${p.first_name ?? ''} ${p.last_name ?? ''}`).trim().toUpperCase()
  )

  const depTime       = fi.std ? new Date(fi.std) : null
  const hoursUntilDep = depTime
    ? Math.max(0, Math.round((depTime - Date.now()) / 3600000))
    : 99

  return {
    id:           String(b.id ?? ''),
    bookingCode:  b.booking_code ?? b.pnr ?? b.code ?? `BK-${b.id}`,
    airline:      route.airline  ?? fi.airline ?? 'VietJett',
    flightNo:     fi.flight_number ?? b.flight_number ?? '—',
    dep:          std ? std.toTimeString().slice(0,5) : (b.dep ?? ''),
    arr:          sta ? sta.toTimeString().slice(0,5) : (b.arr ?? ''),
    date:         fmtDate(depDate),
    depCode:      route.from ?? route.origin?.code ?? b.dep_code ?? '',
    arrCode:      route.to   ?? route.destination?.code ?? b.arr_code ?? '',
    depAirport:   route.from_name ?? b.dep_airport ?? '',
    arrAirport:   route.to_name   ?? b.arr_airport ?? '',
    price:        Number(b.total_price ?? b.amount ?? b.price ?? 0),
    class:        b.cabin_class ?? b.class ?? 'Phổ thông',
    logoColor:    '#1a3c6e',
    passengers:   names,
    status:       (b.status ?? 'confirmed').toLowerCase(),
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
    if (!p || !e) { setError('Vui lòng nhập đầy đủ mã đặt chỗ và email.'); return }
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
            onChange={e => { setPnr(e.target.value.toUpperCase()); setError('') }}
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
            onChange={e => { setEmail(e.target.value); setError('') }}
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
            disabled={loading || !pnr.trim() || !email.trim()}
          >
            {loading ? '⏳ Đang tìm...' : '🔍 Tìm vé'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Step 1 (cũ): Chọn vé ──────────────────────────────────────────────────────
function StepSelectTicket({ tickets, onSelect }) {
  return (
    <div className="ct-step">
      <div className="ct-step__header">
        <div className="ct-step__num">02</div>
        <div>
          <div className="ct-step__title">Chọn vé cần hoàn</div>
          <div className="ct-step__sub">Chọn chuyến bay bạn muốn hoàn</div>
        </div>
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
              <div className="ct-ticket-card__pax">{t.passengers.length} hành khách · {fmt(t.price)}</div>
            </div>
            <div className="ct-ticket-card__arrow-right">›</div>
          </div>
        ))}
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
function StepReason({ ticket, preview, onSubmit, onBack }) {
  const [reason,  setReason]  = useState('')
  const [custom,  setCustom]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit() {
    const finalReason = reason === 'Lý do khác' ? custom.trim() : reason
    if (!finalReason) return
    setLoading(true); setError('')
    try {
      await apiFetch('POST', '/refund/confirm', {
        ticket_ids: [ticket.id],
        reason:     finalReason,
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
        <span>Hoàn tiền: <strong>{fmt(preview?.refund_amount ?? 0)}</strong></span>
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

// ── Root ─────────────────────────────────────────────────────────────────────
export default function CancelTicket() {
  const navigate = useNavigate()
  const location = useLocation()

  // Nếu MyTickets truyền ticket + pnr + email → bỏ qua bước 0 & 1
  const passedTicket = location.state?.ticket ?? null
  const passedPnr    = location.state?.pnr    ?? ''
  const passedEmail  = location.state?.email  ?? ''

  // step: 0=search, 1=select, 2=refund-check, 3=reason
  const [step,    setStep]    = useState(passedTicket ? 2 : 0)
  const [tickets, setTickets] = useState(passedTicket ? [passedTicket] : [])
  const [ticket,  setTicket]  = useState(passedTicket)
  const [preview, setPreview] = useState(null)
  const [searchCtx, setSearchCtx] = useState({ pnr: passedPnr, email: passedEmail })

  // Progress labels tương ứng từng bước
  const STEPS = ['Tra cứu', 'Chọn vé', 'Điều kiện', 'Lý do hoàn']

  function handleFound(foundTickets, pnr, email) {
    setTickets(foundTickets)
    setSearchCtx({ pnr, email })
    // Nếu chỉ 1 vé → thẳng bước 2
    if (foundTickets.length === 1) {
      setTicket(foundTickets[0])
      setStep(2)
    } else {
      setStep(1)
    }
  }

  function handleSubmit(reason) {
    navigate('/my-tickets', {
      state: {
        notification: `Yêu cầu hoàn vé ${ticket.flightNo} đã được gửi. Lý do: ${reason}. Đang chờ xét duyệt.`,
        highlightId:  ticket.id,
        newStatus:    'cancel_pending',
      }
    })
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
          onSelect={t => { setTicket(t); setStep(2) }}
        />
      )}
      {step === 2 && ticket && (
        <StepRefundCheck
          ticket={ticket}
          onContinue={p => { setPreview(p); setStep(3) }}
          onBack={() => setStep(tickets.length > 1 ? 1 : 0)}
        />
      )}
      {step === 3 && ticket && (
        <StepReason
          ticket={ticket}
          preview={preview}
          onSubmit={handleSubmit}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  )
}