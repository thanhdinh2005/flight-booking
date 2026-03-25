// src/components/tabs/TabThuTuc.jsx
// Luồng:
//   1. lookup   → nhập PNR + email → hiện danh sách tickets
//   2. choose   → chọn ticket → chọn "Check-in" hoặc "Hoàn vé"
//   3. verify   → POST /api/verify (first_name, last_name, id_number, date_of_birth)
//   4. seat-map → GET  /api/seat-map?ticket_id=&checkin_token=
//   5. boarding → GET  /api/checkin/boarding-pass/{ticket_id}

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'https://esm.sh/qrcode@1.5.3'

// ─── Auth & API helpers ───────────────────────────────────────────────────────

function getToken() {
  return sessionStorage.getItem('access_token') || localStorage.getItem('access_token')
}

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api'

async function apiFetch(method, path, body = null, extraHeaders = {}) {
  const token = getToken()
  const isGet = method === 'GET'
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(isGet ? {} : { 'Content-Type': 'application/json' }),
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
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

function fmtTime(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) } catch { return iso }
}
function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return iso }
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

  .ci-root {
    font-family: 'Be Vietnam Pro', sans-serif;
    background: #f0fafa; min-height: 100vh;
    padding: 32px 20px 64px;
    --teal: #2aabab; --teal-dark: #1e8888;
    --teal-dim: rgba(42,171,171,.10); --teal-mid: rgba(42,171,171,.22);
    --ink: #1a2a2a; --muted: #5a7a7a;
    --border: rgba(42,171,171,.22);
    --danger: #ef4444; --warn: #f59e0b; --ok: #10b981;
  }
  .ci-wrap       { max-width: 680px; margin: 0 auto; }
  .ci-wrap--wide { max-width: 960px; margin: 0 auto; }

  /* Steps */
  .ci-steps { display: flex; align-items: center; gap: 0; margin-bottom: 36px; }
  .ci-step  { display: flex; align-items: center; gap: 6px; color: var(--muted);
    font-family: 'IBM Plex Mono',monospace; font-size: 10px; letter-spacing:.5px; text-transform:uppercase; }
  .ci-step__dot { width:24px; height:24px; border-radius:50%; border:1.5px solid var(--border);
    display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700;
    flex-shrink:0; background:#fff; color:var(--muted); }
  .ci-step.done   .ci-step__dot { background:var(--teal); border-color:var(--teal); color:#fff; }
  .ci-step.active .ci-step__dot { background:var(--teal-dim); border-color:var(--teal); color:var(--teal); }
  .ci-step.active               { color:var(--teal); font-weight:600; }
  .ci-step__line { flex:1; height:1px; background:var(--border); min-width:20px; max-width:60px; }

  /* Card */
  .ci-card { background:#fff; border:1px solid var(--border); border-radius:16px;
    padding:28px 32px; position:relative; overflow:hidden; }
  .ci-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg,transparent,var(--teal),transparent); }
  .ci-eyebrow { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:3px;
    text-transform:uppercase; color:var(--teal); margin-bottom:6px; }
  .ci-title { font-size:24px; font-weight:800; color:var(--ink); line-height:1.15; }
  .ci-sub   { font-size:13px; color:var(--muted); margin-top:4px; }

  /* Form */
  .ci-field { margin-bottom:18px; }
  .ci-label { display:block; font-size:12px; font-weight:600; color:var(--muted);
    text-transform:uppercase; letter-spacing:.5px; margin-bottom:7px; }
  .ci-input { width:100%; box-sizing:border-box; padding:12px 14px; border-radius:10px;
    border:1.5px solid var(--border); font-size:15px;
    font-family:'IBM Plex Mono',monospace; color:var(--ink); background:#fff;
    outline:none; transition:border-color .15s; letter-spacing:1px; }
  .ci-input:focus { border-color:var(--teal); }
  .ci-input::placeholder { color:#aaa; letter-spacing:0; font-family:'Be Vietnam Pro',sans-serif; }
  .ci-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:520px){ .ci-grid-2 { grid-template-columns:1fr; } }

  /* Buttons */
  .ci-btn { display:inline-flex; align-items:center; justify-content:center; gap:7px;
    padding:13px 28px; border-radius:10px; font-size:14px; font-weight:700;
    cursor:pointer; border:none; transition:background .15s,transform .1s,opacity .15s; }
  .ci-btn:active { transform:scale(.98); }
  .ci-btn--primary { background:var(--teal); color:#fff; }
  .ci-btn--primary:hover { background:var(--teal-dark); }
  .ci-btn--primary:disabled { opacity:.45; cursor:not-allowed; }
  .ci-btn--ghost { background:transparent; color:var(--muted); border:1.5px solid var(--border); }
  .ci-btn--ghost:hover { border-color:var(--teal); color:var(--teal); }
  .ci-btn--danger { background:var(--danger); color:#fff; }
  .ci-btn--warn   { background:#f59e0b; color:#fff; }
  .ci-btn--warn:hover { background:#d97706; }
  .ci-bar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:28px; flex-wrap:wrap; }

  /* Alert */
  .ci-alert { border-radius:10px; padding:12px 16px; font-size:13px;
    display:flex; align-items:flex-start; gap:10px; margin-bottom:18px; line-height:1.5; }
  .ci-alert--error   { background:rgba(239,68,68,.08);  border:1px solid rgba(239,68,68,.25);  color:#b91c1c; }
  .ci-alert--warn    { background:rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.25); color:#92400e; }
  .ci-alert--info    { background:var(--teal-dim);      border:1px solid var(--teal-mid);      color:var(--teal-dark); }
  .ci-alert--success { background:rgba(16,185,129,.08); border:1px solid rgba(16,185,129,.25); color:#065f46; }

  /* Ticket list */
  .tk-list { display:flex; flex-direction:column; gap:12px; margin:20px 0; }
  .tk-card { background:#fff; border:1.5px solid var(--border); border-radius:14px;
    padding:18px 20px; cursor:pointer; transition:border-color .15s,box-shadow .15s,transform .12s; }
  .tk-card:hover { border-color:var(--teal); box-shadow:0 4px 16px rgba(42,171,171,.12); transform:translateY(-1px); }
  .tk-card--selected { border-color:var(--teal); background:var(--teal-dim); }
  .tk-card__top { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
  .tk-card__route { font-size:18px; font-weight:800; color:var(--ink); font-family:'IBM Plex Mono',monospace; }
  .tk-card__badge { font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:.5px; text-transform:uppercase; }
  .tk-card__badge--economy  { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
  .tk-card__badge--business { background:#fffbeb; color:#92400e; border:1px solid #fde68a; }
  .tk-card__meta { display:flex; gap:16px; font-size:12px; color:var(--muted); flex-wrap:wrap; }
  .tk-card__status { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700;
    padding:2px 8px; border-radius:20px; }
  .tk-card__status--pending  { background:#fef3c7; color:#92400e; }
  .tk-card__status--confirmed{ background:#d1fae5; color:#065f46; }
  .tk-card__status--used     { background:#f1f5f9; color:#64748b; }

  /* Action buttons row */
  .tk-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px; }

  /* Seat map */
  .sm-plane-wrap { background:#fff; border:1px solid var(--border); border-radius:12px;
    padding:20px 16px; overflow-x:auto; }
  .sm-header-row,.sm-seat-row { display:flex; align-items:center; gap:0; }
  .sm-row-num { font-family:'IBM Plex Mono',monospace; font-size:10px; color:var(--muted);
    width:28px; flex-shrink:0; text-align:center; }
  .sm-col-label { font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:600;
    color:var(--teal); text-align:center; flex:1; }
  .sm-aisle  { width:18px; flex-shrink:0; }
  .sm-divider{ height:1px; background:var(--border); margin:4px 0; }
  .sm-seat { flex:1; aspect-ratio:1; max-width:34px; min-width:24px;
    border:1.5px solid; border-radius:4px; margin:1.5px;
    display:flex; align-items:center; justify-content:center;
    font-family:'IBM Plex Mono',monospace; font-size:8px; font-weight:700;
    cursor:pointer; transition:all .12s; position:relative; }
  .sm-seat--available    { background:var(--teal-dim); border-color:rgba(42,171,171,.3); color:var(--teal); }
  .sm-seat--available:hover { background:var(--teal-mid); border-color:var(--teal); transform:scale(1.1); z-index:1; }
  .sm-seat--taken        { background:#d8eded; border-color:#9bbebe; color:#9bbebe; cursor:not-allowed; }
  .sm-seat--selected     { background:var(--teal); border-color:var(--teal); color:#fff; transform:scale(1.05); z-index:1; box-shadow:0 0 8px rgba(42,171,171,.4); }
  .sm-seat--locked       { background:#f1f5f9; border-color:#cbd5e1; color:#94a3b8; cursor:not-allowed; opacity:.6; }
  .sm-legend { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:14px; }
  .sm-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--muted); }
  .sm-legend-dot  { width:12px; height:12px; border:1.5px solid; border-radius:2px; flex-shrink:0; }

  /* Boarding pass */
  .bp-card { background:linear-gradient(135deg,#1a3c6e 0%,#2aabab 100%);
    border-radius:20px; padding:32px 28px; color:#fff;
    max-width:380px; margin:0 auto; position:relative; overflow:hidden; }
  .bp-card::after { content:''; position:absolute; left:-20px; right:-20px; top:50%;
    transform:translateY(-50%); height:1px;
    background:repeating-linear-gradient(90deg,rgba(255,255,255,.3) 0,rgba(255,255,255,.3) 8px,transparent 8px,transparent 16px); }
  .bp-airline { font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:3px; opacity:.7; margin-bottom:16px; }
  .bp-route { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
  .bp-iata  { font-size:42px; font-weight:800; line-height:1; }
  .bp-arrow { font-size:20px; opacity:.6; flex:1; text-align:center; }
  .bp-row   { display:flex; gap:20px; margin-bottom:16px; flex-wrap:wrap; }
  .bp-field__label { font-size:9px; letter-spacing:2px; text-transform:uppercase; opacity:.6; margin-bottom:3px; }
  .bp-field__value { font-family:'IBM Plex Mono',monospace; font-size:16px; font-weight:600; }
  .bp-field__value--large { font-size:28px; }
  .bp-qr { margin-top:24px; text-align:center; }
  .bp-qr canvas { border-radius:8px; background:#fff; padding:8px; }
`

// ─── Shared sub-components ────────────────────────────────────────────────────

const STEPS = [
  { id: 'lookup',   label: 'Tra cứu' },
  { id: 'choose',   label: 'Chọn vé' },
  { id: 'verify',   label: 'Xác thực' },
  { id: 'seats',    label: 'Chọn ghế' },
  { id: 'boarding', label: 'Thẻ lên tàu' },
]

function StepBar({ current }) {
  const idx = STEPS.findIndex(s => s.id === current)
  return (
    <div className="ci-steps">
      {STEPS.map((s, i) => (
        <span key={s.id} style={{ display:'contents' }}>
          {i > 0 && <div className="ci-step__line" />}
          <div className={`ci-step${i < idx ? ' done' : i === idx ? ' active' : ''}`}>
            <div className="ci-step__dot">{i < idx ? '✓' : i + 1}</div>
            <span>{s.label}</span>
          </div>
        </span>
      ))}
    </div>
  )
}

function Alert({ type = 'error', children, onClose }) {
  const icons = { error:'⚠️', warn:'⚠️', info:'ℹ️', success:'✅' }
  return (
    <div className={`ci-alert ci-alert--${type}`}>
      <span style={{ fontSize:16, flexShrink:0 }}>{icons[type]}</span>
      <div style={{ flex:1 }}>{children}</div>
      {onClose && <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',fontSize:16,opacity:.6,flexShrink:0 }}>✕</button>}
    </div>
  )
}

function LoadingScreen({ message = 'Đang xử lý...' }) {
  return (
    <div className="ci-root" style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}>
      <style>{BASE_CSS}</style>
      <div style={{ textAlign:'center', color:'var(--muted)' }}>
        <div style={{ fontSize:52, marginBottom:16 }}>✈️</div>
        <div style={{ fontSize:16, fontWeight:600, color:'var(--ink)', marginBottom:8 }}>{message}</div>
        <div style={{ fontSize:13 }}>Vui lòng không đóng trang này</div>
      </div>
    </div>
  )
}

// ─── Giai đoạn 1: Lookup — nhập PNR + email ──────────────────────────────────

function LookupScreen({ onSuccess }) {
  const [pnr,     setPnr]     = useState('')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

 async function handleSubmit() {
  if (!pnr.trim() || !email.trim()) {
    setError('Vui lòng nhập đầy đủ mã đặt chỗ và email.')
    return
  }
  setLoading(true)
  setError('')
  try {
    const params = new URLSearchParams({
      pnr:   pnr.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
    })
    const res  = await apiFetch('GET', `/bookings/search-tickets?${params}`)

    // Response: { success: true, data: [ ticket, ticket, ... ] }
    const list = Array.isArray(res?.data) ? res.data
               : Array.isArray(res)       ? res
               : []

    if (!list.length) throw new Error('Không tìm thấy vé nào với thông tin này.')

    // Nhóm các ticket cùng flight_instance_id → mỗi nhóm là 1 vé
    const grouped = groupTicketsByFlight(list)

    onSuccess({ tickets: grouped, raw: list })
  } catch (err) {
    setError(err.message || 'Không tìm thấy đặt chỗ. Vui lòng kiểm tra lại.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="ci-root">
      <style>{BASE_CSS}</style>
      <div className="ci-wrap">
        <StepBar current="lookup" />
        <div className="ci-card">
          <div className="ci-eyebrow">Thủ tục & Check-in</div>
          <div className="ci-title">Tra cứu đặt chỗ</div>
          <div className="ci-sub" style={{ marginBottom:28 }}>
            Nhập mã PNR và email để xem danh sách vé
          </div>

          {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

          <div className="ci-field">
            <label className="ci-label">Mã đặt chỗ (PNR)</label>
            <input className="ci-input" placeholder="VD: HFD8QM" maxLength={8}
              value={pnr}
              onChange={e => { setPnr(e.target.value.toUpperCase()); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={loading}
              style={{ textTransform:'uppercase' }}
            />
          </div>

          <div className="ci-field">
            <label className="ci-label">Email đặt chỗ</label>
            <input className="ci-input" type="email" placeholder="email@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={loading}
            />
          </div>

          <div className="ci-bar" style={{ marginTop:20 }}>
            <div />
            <button className="ci-btn ci-btn--primary"
              onClick={handleSubmit}
              disabled={loading || !pnr.trim() || !email.trim()}
            >
              {loading ? '⏳ Đang tra cứu...' : 'Tra cứu →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Giai đoạn 2: Choose — danh sách vé, chọn hành động ─────────────────────

function ChooseScreen({ booking, tickets, onCheckin, onRefund, onBack }) {
  const [selected, setSelected] = useState(null)

  function statusLabel(status) {
    const map = { PENDING:'Chờ thanh toán', CONFIRMED:'Đã xác nhận', USED:'Đã sử dụng', CANCELLED:'Đã huỷ' }
    return map[status?.toUpperCase()] ?? status ?? '—'
  }
  function statusClass(status) {
    const s = status?.toUpperCase()
    if (s === 'CONFIRMED') return 'confirmed'
    if (s === 'USED')      return 'used'
    return 'pending'
  }

  return (
    <div className="ci-root">
      <style>{BASE_CSS}</style>
      <div className="ci-wrap">
        <StepBar current="choose" />

        <div style={{ marginBottom:20 }}>
          <div className="ci-eyebrow">Mã đặt chỗ: {booking?.pnr ?? '—'}</div>
          <div className="ci-title">Danh sách vé</div>
          <div className="ci-sub">Chọn vé và hành động bạn muốn thực hiện</div>
        </div>

        <div className="tk-list">
          {tickets.map(t => {
            const origin = t.flight_instance?.route?.origin?.code      ?? '???'
            const dest   = t.flight_instance?.route?.destination?.code ?? '???'
            const std    = t.flight_instance?.std
            const pax    = t.passenger
            const isSelected = selected?.id === t.id

            return (
              <div
                key={t.id}
                className={`tk-card${isSelected ? ' tk-card--selected' : ''}`}
                onClick={() => setSelected(isSelected ? null : t)}
              >
                <div className="tk-card__top">
                  <div className="tk-card__route">{origin} → {dest}</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <span className={`tk-card__badge tk-card__badge--${(t.seat_class||'economy').toLowerCase()}`}>
                      {t.seat_class === 'BUSINESS' ? '👑 Thương gia' : '💺 Phổ thông'}
                    </span>
                    <span className={`tk-card__status tk-card__status--${statusClass(t.status)}`}>
                      {statusLabel(t.status)}
                    </span>
                  </div>
                </div>

                <div className="tk-card__meta">
                  <span>👤 {pax?.last_name} {pax?.first_name}</span>
                  {std && <span>📅 {fmtDate(std)} · {fmtTime(std)}</span>}
                  <span>🎫 Vé #{t.id}</span>
                </div>

                {/* Actions — chỉ hiện khi đang chọn */}
                {isSelected && (
                  <div className="tk-actions">
                    <button
                      className="ci-btn ci-btn--primary"
                      style={{ fontSize:13 }}
                      onClick={e => { e.stopPropagation(); onCheckin(t) }}
                    >
                      ✈️ Check-in
                    </button>
                    <button
                      className="ci-btn ci-btn--warn"
                      style={{ fontSize:13 }}
                      onClick={e => { e.stopPropagation(); onRefund(t) }}
                    >
                      ↩ Hoàn vé
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="ci-bar">
          <button className="ci-btn ci-btn--ghost" onClick={onBack}>← Tra cứu lại</button>
          {!selected && (
            <span style={{ fontSize:12, color:'var(--muted)' }}>Nhấn vào vé để chọn hành động</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Giai đoạn 3: Verify — nhập thông tin định danh → POST /api/verify ───────

function VerifyScreen({ ticket, onSuccess, onBack }) {
  const [form, setForm] = useState({
    first_name:    '',
    last_name:     '',
    id_number:     '',
    date_of_birth: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  const valid = form.first_name.trim() && form.last_name.trim() && form.id_number.trim() && form.date_of_birth

  async function handleSubmit() {
    if (!valid) return
    setLoading(true); setError('')
    try {
      // POST /api/verify
      const res  = await apiFetch('POST', '/verify', {
        ticket_id:     ticket.id,
        first_name:    form.first_name.trim().toUpperCase(),
        last_name:     form.last_name.trim().toUpperCase(),
        id_number:     form.id_number.trim(),
        date_of_birth: form.date_of_birth,
      })
      const data = res?.data ?? res
      // Backend trả: { ticket_id, checkin_token }
      if (!data?.checkin_token) throw new Error('Phản hồi không hợp lệ từ máy chủ.')
      onSuccess({ ticket_id: data.ticket_id ?? ticket.id, checkin_token: data.checkin_token })
    } catch (err) {
      if (err.status === 422 || err.status === 404) {
        setError('Thông tin không khớp với dữ liệu đăng ký. Vui lòng kiểm tra lại.')
      } else {
        setError(err.message || 'Lỗi kết nối. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  const origin = ticket?.flight_instance?.route?.origin?.code      ?? '?'
  const dest   = ticket?.flight_instance?.route?.destination?.code ?? '?'

  return (
    <div className="ci-root">
      <style>{BASE_CSS}</style>
      <div className="ci-wrap">
        <StepBar current="verify" />

        {/* Ticket info pill */}
        <div style={{ background:'var(--teal-dim)', border:'1px solid var(--teal-mid)',
          borderRadius:12, padding:'12px 18px', marginBottom:24,
          display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:'var(--ink)' }}>
              {origin} → {dest}
            </div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>
              Vé #{ticket.id} · {ticket.seat_class}
            </div>
          </div>
        </div>

        <div className="ci-card">
          <div className="ci-eyebrow">Bước 3 / 5</div>
          <div className="ci-title">Xác thực danh tính</div>
          <div className="ci-sub" style={{ marginBottom:24 }}>
            Nhập thông tin khớp với hồ sơ đặt vé
          </div>

          {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

          <div className="ci-grid-2">
            <div className="ci-field">
              <label className="ci-label">Họ (Last name) *</label>
              <input className="ci-input" placeholder="VD: LE THI"
                value={form.last_name}
                onChange={e => set('last_name', e.target.value.toUpperCase())}
                disabled={loading}
              />
            </div>
            <div className="ci-field">
              <label className="ci-label">Tên (First name) *</label>
              <input className="ci-input" placeholder="VD: HOA"
                value={form.first_name}
                onChange={e => set('first_name', e.target.value.toUpperCase())}
                disabled={loading}
              />
            </div>
          </div>

          <div className="ci-field">
            <label className="ci-label">CMND / Hộ chiếu *</label>
            <input className="ci-input" placeholder="VD: 001122334455"
              value={form.id_number}
              onChange={e => set('id_number', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="ci-field">
            <label className="ci-label">Ngày sinh *</label>
            <input className="ci-input" type="date"
              value={form.date_of_birth}
              onChange={e => set('date_of_birth', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="ci-bar">
            <button className="ci-btn ci-btn--ghost" onClick={onBack} disabled={loading}>← Quay lại</button>
            <button className="ci-btn ci-btn--primary"
              onClick={handleSubmit}
              disabled={!valid || loading}
            >
              {loading ? '⏳ Đang xác thực...' : 'Xác thực →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Giai đoạn 4: Seat Map ────────────────────────────────────────────────────

function SeatMapScreen({ checkinToken, ticketId, seatClass, onSuccess, onBack, onExpired }) {
  const [seatMap,    setSeatMap]    = useState([])
  const [selected,   setSelected]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  

  async function fetchSeatMap() {
    setLoading(true); setError('')
    try {
      // GET /api/seat-map?ticket_id=&checkin_token=
      const res  = await apiFetch('GET', `/seat-map?ticket_id=${ticketId}&checkin_token=${checkinToken}`)
      const data = res?.data ?? res
      setSeatMap(data?.seats ?? data ?? [])
      setSelected(null)
    } catch (err) {
      if (err.status === 403) onExpired?.()
      else setError(err.message || 'Không tải được sơ đồ ghế.')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    if (!selected) return
    setSubmitting(true); setError('')
    try {
      // POST /api/checkin/submit
      const res  = await apiFetch('POST', '/checkin/submit', {
        ticket_id:     ticketId,
        seat_number:   selected,
        checkin_token: checkinToken,
      })
      const data = res?.data ?? res
      onSuccess({ seat_number: selected, submit_data: data })
    } catch (err) {
      if (err.status === 409) {
        setError('Ghế vừa bị người khác chọn. Vui lòng chọn ghế khác.')
        setSelected(null); fetchSeatMap()
      } else if (err.status === 403) {
        onExpired?.()
      } else {
        setError(err.message || 'Xác nhận ghế thất bại.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const rows = {}
  seatMap.forEach(s => {
    const r = s.row ?? parseInt(s.seat_number)
    if (!rows[r]) rows[r] = []
    rows[r].push(s)
  })
  const sortedRows = Object.keys(rows).sort((a, b) => Number(a) - Number(b))
  const leftCols   = ['A','B','C']
  const rightCols  = ['D','E','F']

  function getSeatState(seat) {
    if (seat.seat_number === selected) return 'selected'
    if (!seat.is_available)            return 'taken'
    if (seat.is_same_class === false)  return 'locked'
    return 'available'
  }
  function handleClick(seat) {
    const state = getSeatState(seat)
    if (state === 'taken' || state === 'locked') return
    setSelected(state === 'selected' ? null : seat.seat_number)
  }

  return (
    <div className="ci-root">
      <style>{BASE_CSS}</style>
      <div className="ci-wrap--wide">
        <StepBar current="seats" />

        <div style={{ marginBottom:20 }}>
          <div className="ci-eyebrow">Bước 4 / 5</div>
          <div className="ci-title">Chọn chỗ ngồi</div>
          <div className="ci-sub">Nhấn vào ghế trống · Hạng: <strong style={{ color:'var(--teal)' }}>{seatClass || 'ECONOMY'}</strong></div>
        </div>

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 220px', gap:20, alignItems:'start' }}>
          <div className="sm-plane-wrap">
            {loading ? (
              <div style={{ textAlign:'center', padding:'48px 0', color:'var(--muted)', fontSize:14 }}>⏳ Đang tải sơ đồ ghế...</div>
            ) : (
              <>
                <div className="sm-legend">
                  {[
                    { label:'Ghế trống cùng hạng', dot:{ bg:'var(--teal-dim)',  border:'rgba(42,171,171,.3)' } },
                    { label:'Đã có người',          dot:{ bg:'#d8eded',          border:'#9bbebe' } },
                    { label:'Khác hạng vé',         dot:{ bg:'#f1f5f9',          border:'#cbd5e1' } },
                    { label:'Đã chọn',              dot:{ bg:'var(--teal)',       border:'var(--teal)' } },
                  ].map(({ label, dot }) => (
                    <div key={label} className="sm-legend-item">
                      <div className="sm-legend-dot" style={{ background:dot.bg, borderColor:dot.border }} />
                      {label}
                    </div>
                  ))}
                </div>

                <div className="sm-header-row" style={{ marginBottom:6 }}>
                  <div className="sm-row-num" />
                  {leftCols.map(c  => <div key={c} className="sm-col-label">{c}</div>)}
                  <div className="sm-aisle" />
                  {rightCols.map(c => <div key={c} className="sm-col-label">{c}</div>)}
                </div>

                {sortedRows.map((rowNum, idx) => {
                  const rowSeats = rows[rowNum]
                  const find = col => rowSeats.find(s => s.col === col || s.seat_number?.endsWith(col)) ?? null
                  return (
                    <div key={rowNum}>
                      {idx > 0 && Number(rowNum) % 10 === 0 && <div className="sm-divider" />}
                      <div className="sm-seat-row">
                        <div className="sm-row-num">{rowNum}</div>
                        {leftCols.map(col => {
                          const seat  = find(col)
                          if (!seat) return <div key={col} style={{ flex:1, maxWidth:34 }} />
                          const state = getSeatState(seat)
                          return (
                            <div key={seat.seat_number} className={`sm-seat sm-seat--${state}`}
                              onClick={() => handleClick(seat)}
                              title={state === 'locked' ? 'Cần nâng hạng' : seat.seat_number}
                            >
                              {state==='taken'?'×':state==='locked'?'🔒':state==='selected'?'✓':''}
                            </div>
                          )
                        })}
                        <div className="sm-aisle" />
                        {rightCols.map(col => {
                          const seat  = find(col)
                          if (!seat) return <div key={col} style={{ flex:1, maxWidth:34 }} />
                          const state = getSeatState(seat)
                          return (
                            <div key={seat.seat_number} className={`sm-seat sm-seat--${state}`}
                              onClick={() => handleClick(seat)}
                              title={state === 'locked' ? 'Cần nâng hạng' : seat.seat_number}
                            >
                              {state==='taken'?'×':state==='locked'?'🔒':state==='selected'?'✓':''}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          <div>
            <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:18, marginBottom:14 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:12 }}>Ghế đã chọn</div>
              {selected ? (
                <>
                  <div style={{ fontSize:40, fontWeight:800, color:'var(--teal)', fontFamily:"'IBM Plex Mono',monospace", textAlign:'center', padding:'12px 0' }}>{selected}</div>
                  <Alert type="success">Ghế <strong>{selected}</strong> đã sẵn sàng xác nhận.</Alert>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'20px 0', color:'var(--muted)', fontSize:13 }}>Chưa chọn ghế</div>
              )}
            </div>
            <Alert type="info">Ghế bị khoá 🔒 thuộc hạng khác. Liên hệ quầy để nâng hạng.</Alert>
          </div>
        </div>

        <div className="ci-bar">
          <button className="ci-btn ci-btn--ghost" onClick={onBack} disabled={submitting}>← Quay lại</button>
          <button className="ci-btn ci-btn--primary"
            onClick={handleConfirm}
            disabled={!selected || submitting || loading}
          >
            {submitting ? '⏳ Đang xác nhận...' : 'Xác nhận chọn ghế →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Giai đoạn 5: Boarding Pass ──────────────────────────────────────────────

function BoardingPassScreen({ ticketId, checkinToken, seatNumber, onReset }) {
  const navigate = useNavigate()
  const qrRef    = useRef(null)
  const cardRef  = useRef(null)
  const [bp,      setBp]      = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => { fetchBoardingPass() }, [])

  async function fetchBoardingPass() {
    setLoading(true); setError('')
    try {
      // GET /api/checkin/boarding-pass/{ticket_id}
      const token = getToken()
      const res   = await fetch(`${API_BASE}/checkin/boarding-pass/${ticketId}?checkin_token=${checkinToken}`, {
        headers: {
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`)
      setBp(data?.data ?? data)
    } catch (err) {
      setError(err.message || 'Không lấy được thẻ lên máy bay.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!bp?.qr_code_content || !qrRef.current) return
    QRCode.toCanvas(qrRef.current, bp.qr_code_content, { width:140, margin:1 }, () => {})
  }, [bp])

  async function handleDownload() {
    if (!cardRef.current) return
    try {
      const { default: html2canvas } = await import('https://esm.sh/html2canvas@1.4.1')
      const canvas = await html2canvas(cardRef.current, { scale:2, useCORS:true })
      const a = document.createElement('a')
      a.href     = canvas.toDataURL('image/jpeg', 0.95)
      a.download = `boarding-pass-${bp?.seat ?? seatNumber ?? ticketId}.jpg`
      a.click()
    } catch {
      alert('Không xuất được ảnh. Vui lòng chụp màn hình thủ công.')
    }
  }

  if (loading) return <LoadingScreen message="Đang tạo thẻ lên máy bay..." />

  return (
    <div className="ci-root">
      <style>{BASE_CSS}</style>
      <div className="ci-wrap">
        <StepBar current="boarding" />

        {error ? (
          <>
            <Alert type="error">{error}</Alert>
            <button className="ci-btn ci-btn--ghost" onClick={fetchBoardingPass}>↻ Thử lại</button>
          </>
        ) : (
          <>
            <Alert type="success" style={{ marginBottom:24 }}>
              <strong>Check-in thành công!</strong> Thẻ lên máy bay của bạn đã sẵn sàng.
            </Alert>

            <div ref={cardRef} className="bp-card" style={{ marginBottom:28 }}>
              <div className="bp-airline">VIETJEXT AIRLINES · BOARDING PASS</div>
              <div className="bp-route">
                <div>
                  <div style={{ fontSize:11, opacity:.6, marginBottom:2 }}>Từ</div>
                  <div className="bp-iata">{bp?.origin ?? '—'}</div>
                  <div style={{ fontSize:11, opacity:.7 }}>{bp?.origin_city ?? ''}</div>
                </div>
                <div className="bp-arrow">✈</div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:11, opacity:.6, marginBottom:2 }}>Đến</div>
                  <div className="bp-iata">{bp?.destination ?? '—'}</div>
                  <div style={{ fontSize:11, opacity:.7 }}>{bp?.destination_city ?? ''}</div>
                </div>
              </div>
              <div className="bp-row">
                <div className="bp-field">
                  <div className="bp-field__label">Hành khách</div>
                  <div className="bp-field__value">{bp?.passenger_name ?? '—'}</div>
                </div>
                <div className="bp-field">
                  <div className="bp-field__label">Số ghế</div>
                  <div className="bp-field__value bp-field__value--large" style={{ color:'#fde68a' }}>
                    {bp?.seat ?? seatNumber ?? '—'}
                  </div>
                </div>
              </div>
              <div className="bp-row">
                <div className="bp-field">
                  <div className="bp-field__label">Chuyến bay</div>
                  <div className="bp-field__value">{bp?.flight_number ?? '—'}</div>
                </div>
                <div className="bp-field">
                  <div className="bp-field__label">Cửa (Gate)</div>
                  <div className="bp-field__value">{bp?.gate ?? '—'}</div>
                </div>
                <div className="bp-field">
                  <div className="bp-field__label">Lên máy bay</div>
                  <div className="bp-field__value">{bp?.boarding_time ? fmtTime(bp.boarding_time) : '—'}</div>
                </div>
              </div>
              <div className="bp-row">
                <div className="bp-field">
                  <div className="bp-field__label">Khởi hành</div>
                  <div className="bp-field__value">{bp?.departure_time ? fmtTime(bp.departure_time) : '—'}</div>
                </div>
                <div className="bp-field">
                  <div className="bp-field__label">Ngày bay</div>
                  <div className="bp-field__value">{bp?.departure_date ? fmtDate(bp.departure_date) : '—'}</div>
                </div>
                <div className="bp-field">
                  <div className="bp-field__label">Hạng</div>
                  <div className="bp-field__value">{bp?.cabin_class ?? 'ECONOMY'}</div>
                </div>
              </div>
              {bp?.qr_code_content && (
                <div className="bp-qr">
                  <canvas ref={qrRef} />
                  <div style={{ fontSize:10, opacity:.6, marginTop:6, letterSpacing:1 }}>SCAN TO VERIFY</div>
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:24 }}>
              <button className="ci-btn ci-btn--ghost" onClick={handleDownload}>📥 Tải về (.jpg)</button>
              <button className="ci-btn ci-btn--primary" onClick={() => navigate('/home', { replace:true })}>Hoàn tất ✓</button>
            </div>

            <Alert type="info">
              Vui lòng có mặt tại cửa <strong>{bp?.gate ?? '...'}</strong> trước{' '}
              <strong>{bp?.boarding_time ? fmtTime(bp.boarding_time) : '...'}</strong>.
            </Alert>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Root orchestrator ────────────────────────────────────────────────────────

export default function TabThuTuc({ onAction }) {
  const [screen,  setScreen]  = useState('lookup')
  const [session, setSession] = useState({
    booking:       null,
    tickets:       [],
    ticket:        null,    // vé đang xử lý
    checkin_token: null,
    ticket_id:     null,
    seat_class:    'ECONOMY',
    seat_number:   null,
  })

  function reset() {
    setScreen('lookup')
    setSession({ booking:null, tickets:[], ticket:null, checkin_token:null, ticket_id:null, seat_class:'ECONOMY', seat_number:null })
    onAction?.('↩ Quay về tra cứu')
  }

  return (
    <>
      {/* GĐ 1: Lookup */}
      {screen === 'lookup' && (
        <LookupScreen
          onSuccess={({ booking, tickets }) => {
            setSession(s => ({ ...s, booking, tickets }))
            setScreen('choose')
            onAction?.(`🔍 Tìm thấy ${tickets.length} vé — PNR: ${booking?.pnr ?? ''}`)
          }}
        />
      )}

      {/* GĐ 2: Choose */}
      {screen === 'choose' && (
        <ChooseScreen
          booking={session.booking}
          tickets={session.tickets}
          onCheckin={ticket => {
            setSession(s => ({ ...s, ticket, ticket_id: ticket.id, seat_class: ticket.seat_class ?? 'ECONOMY' }))
            setScreen('verify')
            onAction?.(`✈️ Check-in vé #${ticket.id}`)
          }}
          onRefund={ticket => {
            setSession(s => ({ ...s, ticket }))
            onAction?.(`↩ Yêu cầu hoàn vé #${ticket.id}`)
            alert(`Chức năng hoàn vé vé #${ticket.id} đang được phát triển.\nVui lòng liên hệ hotline hoặc quầy dịch vụ.`)
          }}
          onBack={reset}
        />
      )}

      {/* GĐ 3: Verify */}
      {screen === 'verify' && (
        <VerifyScreen
          ticket={session.ticket}
          onSuccess={({ ticket_id, checkin_token }) => {
            setSession(s => ({ ...s, ticket_id, checkin_token }))
            setScreen('seats')
            onAction?.('✅ Xác thực thành công — chọn ghế')
          }}
          onBack={() => setScreen('choose')}
        />
      )}

      {/* GĐ 4: Seat Map */}
      {screen === 'seats' && (
        <SeatMapScreen
          checkinToken={session.checkin_token}
          ticketId={session.ticket_id}
          seatClass={session.seat_class}
          onSuccess={({ seat_number }) => {
            setSession(s => ({ ...s, seat_number }))
            setScreen('boarding')
            onAction?.(`💺 Ghế ${seat_number} xác nhận — đang lấy boarding pass`)
          }}
          onBack={() => setScreen('verify')}
          onExpired={() => {
            reset()
            onAction?.('⚠️ Phiên hết hạn — xác thực lại')
          }}
        />
      )}

      {/* GĐ 5: Boarding Pass */}
      {screen === 'boarding' && (
        <BoardingPassScreen
          ticketId={session.ticket_id}
          checkinToken={session.checkin_token}
          seatNumber={session.seat_number}
          onReset={reset}
        />
      )}
    </>
  )
}