// src/pages/CancelTicket.jsx
// Luồng: chọn vé → kiểm tra điều kiện hoàn tiền → nhập lý do → xác nhận → MyTickets
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/CancelTicket.css'

// Mock vé đã mua
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
    refundPolicy: { eligible: true,  cutoffHours: 24, feePercent: 30 },
    hoursUntilDep: 36,  // còn 36h → đủ điều kiện
    status: 'confirmed',
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
    refundPolicy: { eligible: false, cutoffHours: null, feePercent: 100 },
    hoursUntilDep: 60,
    status: 'confirmed',
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
    refundPolicy: { eligible: true, cutoffHours: 48, feePercent: 25 },
    hoursUntilDep: 72,
    status: 'confirmed',
  },
]

const CANCEL_REASONS = [
  'Thay đổi kế hoạch cá nhân',
  'Có việc khẩn cấp / sức khoẻ',
  'Đặt nhầm ngày / chuyến',
  'Đặt trùng vé',
  'Chuyến bay bị thay đổi',
  'Lý do khác',
]

function fmt(n) { return n.toLocaleString('vi-VN') + '₫' }

// ── Step 1: Chọn vé ──────────────────────────────────────────────────────────
function StepSelectTicket({ onSelect }) {
  return (
    <div className="ct-step">
      <div className="ct-step__header">
        <div className="ct-step__num">01</div>
        <div>
          <div className="ct-step__title">Chọn vé cần hủy</div>
          <div className="ct-step__sub">Chọn chuyến bay bạn muốn hủy</div>
        </div>
      </div>

      <div className="ct-tickets">
        {MY_TICKETS.map(t => (
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
            <div className="ct-ticket-card__refund">
              {t.refundPolicy.eligible
                ? <span className="ct-tag ct-tag--ok">Có thể hoàn</span>
                : <span className="ct-tag ct-tag--no">Không hoàn</span>
              }
            </div>
            <div className="ct-ticket-card__arrow-right">›</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Điều kiện hoàn tiền ──────────────────────────────────────────────
function StepRefundCheck({ ticket, onContinue, onBack }) {
  const p = ticket.refundPolicy
  const refundAmt = p.eligible
    ? Math.round(ticket.price * (1 - p.feePercent / 100))
    : 0

  return (
    <div className="ct-step">
      <div className="ct-step__header">
        <div className="ct-step__num">02</div>
        <div>
          <div className="ct-step__title">Điều kiện hoàn tiền</div>
          <div className="ct-step__sub">{ticket.flightNo} · {ticket.date}</div>
        </div>
      </div>

      {/* Refund result card */}
      <div className={`ct-refund-card${p.eligible ? ' ct-refund-card--ok' : ' ct-refund-card--no'}`}>
        <div className="ct-refund-card__icon">{p.eligible ? '✓' : '✗'}</div>
        <div className="ct-refund-card__body">
          <div className="ct-refund-card__verdict">
            {p.eligible ? 'Đủ điều kiện hoàn tiền' : 'Không đủ điều kiện hoàn tiền'}
          </div>
          {p.eligible ? (
            <>
              <div className="ct-refund-card__detail">
                Hủy trước {p.cutoffHours}h → phí hủy <strong>{p.feePercent}%</strong>
              </div>
              <div className="ct-refund-card__amount">
                Bạn nhận lại: <strong>{fmt(refundAmt)}</strong>
                <span className="ct-refund-card__orig"> (từ {fmt(ticket.price)})</span>
              </div>
            </>
          ) : (
            <div className="ct-refund-card__detail">
              Vé của hãng này không hỗ trợ hoàn tiền. Bạn có thể tiếp tục hủy nhưng sẽ không nhận lại tiền.
            </div>
          )}
        </div>
      </div>

      {/* Timeline còn lại */}
      <div className="ct-timeline">
        <div className="ct-timeline__row">
          <span className="ct-timeline__label">Thời điểm hiện tại</span>
          <span className="ct-timeline__value">Còn {ticket.hoursUntilDep}h đến khởi hành</span>
        </div>
        {p.eligible && (
          <div className="ct-timeline__row">
            <span className="ct-timeline__label">Hạn chót hoàn tiền</span>
            <span className={`ct-timeline__value ${ticket.hoursUntilDep > p.cutoffHours ? 'ct-ok' : 'ct-warn'}`}>
              {ticket.hoursUntilDep > p.cutoffHours ? `✓ Còn trong thời hạn ${p.cutoffHours}h` : `⚠ Đã qua hạn ${p.cutoffHours}h`}
            </span>
          </div>
        )}
      </div>

      <div className="ct-actions">
        <button className="ct-btn ct-btn--ghost" onClick={onBack}>← Quay lại</button>
        <button className="ct-btn ct-btn--primary" onClick={() => onContinue(refundAmt)}>
          Tiếp tục hủy vé →
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Nhập lý do ───────────────────────────────────────────────────────
function StepReason({ ticket, refundAmt, onSubmit, onBack }) {
  const [reason,  setReason]  = useState('')
  const [custom,  setCustom]  = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit() {
    const finalReason = reason === 'Lý do khác' ? custom.trim() : reason
    if (!finalReason) return
    setLoading(true)
    setTimeout(() => { setLoading(false); onSubmit(finalReason) }, 1200)
  }

  const canSubmit = reason && (reason !== 'Lý do khác' || custom.trim())

  return (
    <div className="ct-step">
      <div className="ct-step__header">
        <div className="ct-step__num">03</div>
        <div>
          <div className="ct-step__title">Lý do hủy vé</div>
          <div className="ct-step__sub">Thông tin giúp chúng tôi cải thiện dịch vụ</div>
        </div>
      </div>

      {/* Summary */}
      <div className="ct-summary-bar">
        <span>{ticket.depCode}→{ticket.arrCode} · {ticket.date}</span>
        <span>Hoàn tiền: <strong>{fmt(refundAmt)}</strong></span>
      </div>

      {/* Reason chips */}
      <div className="ct-reasons">
        {CANCEL_REASONS.map(r => (
          <button
            key={r}
            className={`ct-reason-chip${reason === r ? ' ct-reason-chip--active' : ''}`}
            onClick={() => setReason(r)}
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
        />
      )}

      <div className="ct-actions">
        <button className="ct-btn ct-btn--ghost" onClick={onBack}>← Quay lại</button>
        <button
          className={`ct-btn ct-btn--danger${!canSubmit ? ' ct-btn--disabled' : ''}`}
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? '⏳ Đang xử lý...' : '🚫 Xác nhận hủy vé'}
        </button>
      </div>
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function CancelTicket() {
  const navigate = useNavigate()
  const [step,      setStep]      = useState(1)
  const [ticket,    setTicket]    = useState(null)
  const [refundAmt, setRefundAmt] = useState(0)

  function handleSubmit(reason) {
    // Lưu trạng thái "đang chờ duyệt" rồi điều hướng sang MyTickets
    navigate('/my-tickets', {
      state: {
        notification: `Yêu cầu hủy vé ${ticket.flightNo} đã được gửi. Lý do: ${reason}. Đang chờ xét duyệt.`,
        highlightId: ticket.id,
        newStatus: 'cancel_pending',
      }
    })
  }

  return (
    <div className="ct-root">
      {/* Progress steps */}
      <div className="ct-progress">
        {['Chọn vé', 'Điều kiện', 'Lý do hủy'].map((s, i) => (
          <div key={s} className={`ct-progress__step${step > i + 1 ? ' done' : ''}${step === i + 1 ? ' active' : ''}`}>
            <div className="ct-progress__dot">{step > i + 1 ? '✓' : i + 1}</div>
            <span>{s}</span>
            {i < 2 && <div className="ct-progress__line" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <StepSelectTicket onSelect={t => { setTicket(t); setStep(2) }} />
      )}
      {step === 2 && ticket && (
        <StepRefundCheck
          ticket={ticket}
          onContinue={amt => { setRefundAmt(amt); setStep(3) }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && ticket && (
        <StepReason
          ticket={ticket}
          refundAmt={refundAmt}
          onSubmit={handleSubmit}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  )
}