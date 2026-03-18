// src/pages/ChangeFlight.jsx
// Luồng: chọn vé → kiểm tra điều kiện đổi → nhập lý do → chọn chuyến mới (FlightResults) → MyTickets
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlightResults from './Flightresults'
import '../styles/Changeflight.css'

const MY_TICKETS = [
  {
    id: 'BK001', bookingCode: 'VB-4X9K2',
    airline: 'Vietnam Airlines', flightNo: 'VN-201',
    dep: '07:00', arr: '09:10', date: '20/04/2026',
    depCode: 'HAN', arrCode: 'SGN',
    depAirport: 'Nội Bài', arrAirport: 'Tân Sơn Nhất',
    price: 2500000, class: 'Phổ thông',
    logoColor: '#1a3c6e',
    passengers: ['NGUYEN VAN AN', 'TRAN THI BINH'],
    changePolicy: { eligible: true,  fee: 200000, cutoffHours: 48 },
    hoursUntilDep: 72,
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
    changePolicy: { eligible: true,  fee: 300000, cutoffHours: 24 },
    hoursUntilDep: 96,
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
    changePolicy: { eligible: false, fee: null, cutoffHours: null },
    hoursUntilDep: 12,  // quá gần → không đổi được
  },
]

const CHANGE_REASONS = [
  'Thay đổi kế hoạch công tác',
  'Lý do sức khoẻ / gia đình',
  'Cần chuyến bay sớm hơn',
  'Cần chuyến bay muộn hơn',
  'Chuyến đang chọn không thuận tiện',
  'Lý do khác',
]

function fmt(n) { return n.toLocaleString('vi-VN') + '₫' }

// ── Step 1: Chọn vé ──────────────────────────────────────────────────────────
function StepSelectTicket({ onSelect }) {
  return (
    <div className="cf-step">
      <div className="cf-step__header">
        <div className="cf-step__num">01</div>
        <div>
          <div className="cf-step__title">Chọn vé cần đổi chuyến</div>
          <div className="cf-step__sub">Chỉ hiện vé đủ điều kiện đổi</div>
        </div>
      </div>

      <div className="cf-tickets">
        {MY_TICKETS.map(t => {
          const ok = t.changePolicy.eligible && t.hoursUntilDep >= t.changePolicy.cutoffHours
          return (
            <div
              key={t.id}
              className={`cf-ticket-card${!ok ? ' cf-ticket-card--disabled' : ''}`}
              onClick={() => ok && onSelect(t)}
            >
              <div className="cf-ticket-card__badge" style={{ background: t.logoColor }}>
                {t.airline.split(' ').map(w => w[0]).join('').slice(0,2)}
              </div>
              <div className="cf-ticket-card__main">
                <div className="cf-ticket-card__route">
                  <span className="cf-ticket-card__code">{t.depCode}</span>
                  <span className="cf-ticket-card__arrow">→</span>
                  <span className="cf-ticket-card__code">{t.arrCode}</span>
                </div>
                <div className="cf-ticket-card__meta">{t.flightNo} · {t.date} · {t.dep}–{t.arr}</div>
                <div className="cf-ticket-card__pax">{t.passengers.length} hành khách · {fmt(t.price)}</div>
              </div>
              <div className="cf-ticket-card__status">
                {ok
                  ? <span className="cf-tag cf-tag--ok">Đổi được · Phí {fmt(t.changePolicy.fee)}</span>
                  : <span className="cf-tag cf-tag--no">
                      {!t.changePolicy.eligible ? 'Không cho đổi' : `Quá hạn ${t.changePolicy.cutoffHours}h`}
                    </span>
                }
              </div>
              {ok && <div className="cf-ticket-card__arrow-right">›</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 2: Điều kiện đổi chuyến ────────────────────────────────────────────
function StepChangeCheck({ ticket, onContinue, onBack }) {
  const p = ticket.changePolicy
  return (
    <div className="cf-step">
      <div className="cf-step__header">
        <div className="cf-step__num">02</div>
        <div>
          <div className="cf-step__title">Điều kiện đổi chuyến</div>
          <div className="cf-step__sub">{ticket.flightNo} · {ticket.date}</div>
        </div>
      </div>

      <div className="cf-change-card">
        <div className="cf-change-card__icon">🔄</div>
        <div className="cf-change-card__body">
          <div className="cf-change-card__verdict">Đủ điều kiện đổi chuyến</div>
          <div className="cf-change-card__detail">
            Phí đổi vé: <strong>{fmt(p.fee)}</strong> · Hạn chót: trước <strong>{p.cutoffHours}h</strong> khởi hành
          </div>
          <div className="cf-change-card__note">
            Sau khi chọn chuyến mới, chênh lệch giá (nếu có) sẽ được tính thêm.
          </div>
        </div>
      </div>

      <div className="cf-info-grid">
        {[
          ['Hành trình', `${ticket.depCode} → ${ticket.arrCode}`],
          ['Chuyến hiện tại', `${ticket.flightNo} · ${ticket.date}`],
          ['Giờ khởi hành', ticket.dep],
          ['Còn lại', `${ticket.hoursUntilDep}h đến khởi hành`],
          ['Hành khách', `${ticket.passengers.length} người`],
          ['Đã trả', fmt(ticket.price)],
        ].map(([k, v]) => (
          <div key={k} className="cf-kv">
            <div className="cf-kv__k">{k}</div>
            <div className="cf-kv__v">{v}</div>
          </div>
        ))}
      </div>

      <div className="cf-actions">
        <button className="cf-btn cf-btn--ghost" onClick={onBack}>← Quay lại</button>
        <button className="cf-btn cf-btn--primary" onClick={onContinue}>Tiếp tục →</button>
      </div>
    </div>
  )
}

// ── Step 3: Lý do đổi ───────────────────────────────────────────────────────
function StepReason({ ticket, onNext, onBack }) {
  const [reason, setReason] = useState('')
  const [custom, setCustom] = useState('')

  function handleNext() {
    const r = reason === 'Lý do khác' ? custom.trim() : reason
    if (!r) return
    onNext(r)
  }

  const canNext = reason && (reason !== 'Lý do khác' || custom.trim())

  return (
    <div className="cf-step">
      <div className="cf-step__header">
        <div className="cf-step__num">03</div>
        <div>
          <div className="cf-step__title">Lý do đổi chuyến</div>
          <div className="cf-step__sub">Chọn lý do phù hợp nhất</div>
        </div>
      </div>

      <div className="cf-reasons">
        {CHANGE_REASONS.map(r => (
          <button
            key={r}
            className={`cf-reason-chip${reason === r ? ' cf-reason-chip--active' : ''}`}
            onClick={() => setReason(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {reason === 'Lý do khác' && (
        <textarea
          className="cf-textarea"
          placeholder="Mô tả lý do của bạn..."
          value={custom}
          onChange={e => setCustom(e.target.value)}
          rows={3}
        />
      )}

      <div className="cf-actions">
        <button className="cf-btn cf-btn--ghost" onClick={onBack}>← Quay lại</button>
        <button
          className={`cf-btn cf-btn--primary${!canNext ? ' cf-btn--disabled' : ''}`}
          disabled={!canNext}
          onClick={handleNext}
        >
          Xem chuyến bay đề xuất →
        </button>
      </div>
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function ChangeFlight() {
  const navigate = useNavigate()
  const [step,   setStep]   = useState(1)
  const [ticket, setTicket] = useState(null)
  const [reason, setReason] = useState('')

  function handleFlightSelect(newFlight) {
    navigate('/my-tickets', {
      state: {
        notification: `Yêu cầu đổi vé ${ticket.flightNo} → ${newFlight.flightNo} đã gửi. Đang chờ xác nhận.`,
        highlightId: ticket.id,
        newStatus: 'change_pending',
      }
    })
  }

  const steps = ['Chọn vé', 'Điều kiện', 'Lý do', 'Chọn chuyến mới']

  return (
    <div className="cf-root">
      {/* Progress */}
      <div className="cf-progress">
        {steps.map((s, i) => (
          <div key={s} className={`cf-progress__step${step > i + 1 ? ' done' : ''}${step === i + 1 ? ' active' : ''}`}>
            <div className="cf-progress__dot">{step > i + 1 ? '✓' : i + 1}</div>
            <span>{s}</span>
            {i < steps.length - 1 && <div className="cf-progress__line" />}
          </div>
        ))}
      </div>

      {step === 1 && <StepSelectTicket onSelect={t => { setTicket(t); setStep(2) }} />}
      {step === 2 && ticket && (
        <StepChangeCheck
          ticket={ticket}
          onContinue={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && ticket && (
        <StepReason
          ticket={ticket}
          onNext={r => { setReason(r); setStep(4) }}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && ticket && (
        <div className="cf-step">
          <div className="cf-step__header">
            <div className="cf-step__num">04</div>
            <div>
              <div className="cf-step__title">Chọn chuyến bay mới</div>
              <div className="cf-step__sub">
                Các chuyến {ticket.depCode}→{ticket.arrCode} trong 7 ngày tới · Lý do: {reason}
              </div>
            </div>
          </div>
          <FlightResults
            mode="change"
            searchData={{
              from: ticket.depCode,
              to: ticket.arrCode,
              fromLabel: ticket.depAirport,
              toLabel: ticket.arrAirport,
              date: '2026-04-20',
              passengers: String(ticket.passengers.length),
              changeFromFlight: ticket.flightNo,
              changeFee: ticket.changePolicy.fee,
            }}
            onSelect={handleFlightSelect}
            onBack={() => setStep(3)}
          />
        </div>
      )}
    </div>
  )
}