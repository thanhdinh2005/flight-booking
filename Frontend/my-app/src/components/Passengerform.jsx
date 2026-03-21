// PassengerForm.jsx — Điền thông tin hành khách & thanh toán
import { useState } from "react";
import '../styles/Passenger.css';

function fmt(n) { return Number(n || 0).toLocaleString("vi-VN") + "₫"; }

// Chuẩn hoá ngày từ mọi format: ISO, YYYY-MM-DD, dd/MM/yyyy, timestamp
function parseDate(raw) {
  if (!raw) return null;
  if (raw instanceof Date) return isNaN(raw) ? null : raw;
  if (typeof raw === 'number') return new Date(raw);
  const s = String(raw).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    return new Date(`${y}-${m}-${d}`);
  }
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
function fmtDate(raw) {
  const d = parseDate(raw);
  if (!d) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Refund Policy Modal (inline) ──────────────────────────────────────────────
function RefundPolicyModal({ flight, onClose, onAgree }) {
  return (
    <div className="rpm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rpm-box">
        <div className="rpm-header">
          <span>📋 Chính sách hoàn vé</span>
          <button className="rpm-close" onClick={onClose}>✕</button>
        </div>
        <div className="rpm-body">
          <div className="rpm-row"><span>Hoàn vé</span><b>{flight?.refund || 'Vui lòng kiểm tra với hãng'}</b></div>
          <div className="rpm-row"><span>Đổi vé</span><b>{flight?.exchange || 'Vui lòng kiểm tra với hãng'}</b></div>
          <div className="rpm-row"><span>Hành lý xách tay</span><b>{flight?.baggage || '—'}</b></div>
          <div className="rpm-row"><span>Hành lý ký gửi</span><b>{flight?.checkin || '—'}</b></div>
          <p className="rpm-note">⚠️ Chính sách có thể thay đổi. Vui lòng xác nhận với hãng hàng không trước khi đặt vé.</p>
        </div>
        <div className="rpm-footer">
          <button className="pf-btn-back" onClick={onClose}>Đóng</button>
          <button className="pf-btn-next" onClick={() => { onAgree?.(); onClose(); }}>✓ Đã đọc & Đồng ý</button>
        </div>
      </div>
    </div>
  );
}

const PAYMENT_METHODS = [
  { id: "card",   icon: "💳", name: "Thẻ tín dụng / ghi nợ" },
  { id: "momo",   icon: "💜", name: "Ví MoMo" },
  { id: "vnpay",  icon: "🏦", name: "VNPay QR" },
  { id: "bank",   icon: "🏛️", name: "Chuyển khoản" },
];

export default function PassengerForm({
  flight = {
    airline: "VietJet Air", code: "VJ",
    dep: "09:30", arr: "11:45", duration: "2g15p",
    price: 890000, class: "Phổ thông",
    refund: "Không hoàn", exchange: "Phí 300.000₫",
    baggage: "1 xách tay 7kg", checkin: "Không (có thể mua thêm)",
  },
  searchData = { from: "HAN", to: "SGN", date: "2026-04-01", passengers: "2" },
  onBack = () => {},
  onDone = () => {},
}) {
  const pax = parseInt(searchData.passengers);
  const [subStep, setSubStep] = useState(0); // 0=info, 1=payment
  const [forms, setForms] = useState(() =>
    Array.from({ length: pax }, () => ({ name: "", dob: "", phone: "", email: "", passport: "" }))
  );
  const [policyRead, setPolicyRead] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [payMethod, setPayMethod] = useState("card");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  function upd(i, k, v) {
    setForms(p => p.map((f, idx) => idx === i ? { ...f, [k]: v } : f));
  }

  const basePrice = flight.price * pax;
  const tax = Math.round(basePrice * 0.1);
  const total = basePrice + tax;

  const infoValid = forms.every(f => f.name && f.dob && f.phone) && policyRead;

  function pay() {
    setPaying(true);
    setTimeout(() => { setPaying(false); setDone(true); onDone(); }, 2200);
  }

  const stepLabels = ["Thông tin", "Thanh toán"];

  if (done) return (
    <>
      <div className="pf-root">
        <div className="pf-container">
          <div className="pf-card pf-success">
            <span className="pf-success__icon">🌿</span>
            <div className="pf-success__title">Đặt vé thành công!</div>
            <div className="pf-success__code">
              Mã đặt chỗ: <strong>VB-{Math.random().toString(36).slice(2, 8).toUpperCase()}</strong>
            </div>
            <div style={{ fontSize: 14, color: "#8a7f74", lineHeight: 1.7 }}>
              Vé điện tử đã được gửi tới email của bạn.<br />Chúc chuyến đi thật vui vẻ! ✈️
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
     
      {showPolicy && (
        <RefundPolicyModal
          flight={flight}
          onClose={() => setShowPolicy(false)}
          onAgree={() => { setPolicyRead(true); setShowPolicy(false); }}
        />
      )}
      <div className="pf-root">
        <div className="pf-container">

          {/* Steps */}
          <div className="pf-steps">
            {stepLabels.map((label, i) => (
              <>
                <div className="pf-step" key={i}>
                  <div className={`pf-step__circle pf-step__circle--${subStep > i ? "done" : subStep === i ? "active" : "idle"}`}>
                    {subStep > i ? "✓" : i + 1}
                  </div>
                  <span className={`pf-step__label${subStep === i ? " pf-step__label--active" : ""}`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`pf-step-line${subStep > i ? " pf-step-line--done" : ""}`} key={`line-${i}`} />
                )}
              </>
            ))}
          </div>

          {/* Flight pill */}
          <div className="pf-flight-pill">
            <span>✈️ {flight.airline}</span>
            <span className="pf-flight-pill__sep">·</span>
            <span>{searchData.from} → {searchData.to}</span>
            <span className="pf-flight-pill__sep">·</span>
            <span>{fmtDate(searchData.date)}</span>
            <span className="pf-flight-pill__sep">·</span>
            <span>{flight.dep || flight.dep_time} – {flight.arr || flight.arr_time}</span>
            <span className="pf-flight-pill__sep">·</span>
            <span>{pax} khách</span>
            <span className="pf-flight-pill__price">{fmt(total)}</span>
          </div>

          {/* ── Sub-step 0: Passenger info ── */}
          {subStep === 0 && (
            <>
              {forms.map((f, i) => (
                <div className="pf-card" key={i}>
                  <div className="pf-card__title">
                    <span className="pf-card__title-icon">👤</span>
                    Hành khách {i + 1}
                  </div>
                  <div className="pf-grid-2">
                    <div className="pf-grid-full">
                      <div className="pf-field">
                        <label>Họ và tên *</label>
                        <input placeholder="NGUYEN VAN A" value={f.name}
                          onChange={e => upd(i, "name", e.target.value.toUpperCase())} />
                      </div>
                    </div>
                    <div className="pf-field">
                      <label>Ngày sinh *</label>
                      <input type="date" value={f.dob} onChange={e => upd(i, "dob", e.target.value)} />
                    </div>
                    <div className="pf-field">
                      <label>Số điện thoại *</label>
                      <input placeholder="09xxxxxxxx" value={f.phone} onChange={e => upd(i, "phone", e.target.value)} />
                    </div>
                    <div className="pf-field">
                      <label>Email</label>
                      <input placeholder="email@example.com" value={f.email} onChange={e => upd(i, "email", e.target.value)} />
                    </div>
                    <div className="pf-field">
                      <label>CMND / Hộ chiếu</label>
                      <input placeholder="0123456789" value={f.passport} onChange={e => upd(i, "passport", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Policy */}
              <div className="pf-policy-row">
                <button className={`pf-policy-btn${policyRead ? " read" : ""}`} onClick={() => setShowPolicy(true)}>
                  {policyRead ? "✓ Đã xem" : "📋 Chính sách hoàn vé"}
                </button>
                <div className="pf-policy-note">
                  {policyRead
                    ? <><span className="pf-policy-check">✓</span> Bạn đã đọc và đồng ý với chính sách hoàn vé</>
                    : "Vui lòng đọc chính sách hoàn vé trước khi tiếp tục đặt vé"}
                </div>
              </div>

              <div className="pf-btn-row">
                <button className="pf-btn-back" onClick={onBack}>← Quay lại</button>
                <button className="pf-btn-next" disabled={!infoValid} onClick={() => setSubStep(1)}>
                  Tiếp tục →
                </button>
              </div>
            </>
          )}

          {/* ── Sub-step 1: Payment ── */}
          {subStep === 1 && (
            <>
              <div className="pf-card">
                <div className="pf-card__title">
                  <span className="pf-card__title-icon">💰</span>
                  Tổng chi phí
                </div>
                <div className="pf-price-table">
                  <div className="pf-price-row"><span>Giá vé ({pax} người)</span><b>{fmt(basePrice)}</b></div>
                  <div className="pf-price-row"><span>Thuế & phí (10%)</span><b>{fmt(tax)}</b></div>
                  <div className="pf-price-total"><span>Tổng thanh toán</span><span>{fmt(total)}</span></div>
                </div>
              </div>

              <div className="pf-card">
                <div className="pf-card__title">
                  <span className="pf-card__title-icon">💳</span>
                  Phương thức thanh toán
                </div>
                <div className="pf-payment-grid">
                  {PAYMENT_METHODS.map(m => (
                    <div key={m.id} className={`pf-payment-opt${payMethod === m.id ? " active" : ""}`} onClick={() => setPayMethod(m.id)}>
                      <span className="pf-payment-opt__icon">{m.icon}</span>
                      <span className="pf-payment-opt__name">{m.name}</span>
                    </div>
                  ))}
                </div>

                {payMethod === "card" && (
                  <div style={{ marginTop: 4 }}>
                    <div className="pf-field" style={{ marginBottom: 12 }}>
                      <label>Số thẻ</label>
                      <input placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div className="pf-grid-2">
                      <div className="pf-field">
                        <label>Ngày hết hạn</label>
                        <input placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className="pf-field">
                        <label>CVV</label>
                        <input placeholder="•••" maxLength={3} type="password" />
                      </div>
                      <div className="pf-grid-full pf-field">
                        <label>Tên chủ thẻ</label>
                        <input placeholder="NGUYEN VAN A" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pf-btn-row">
                <button className="pf-btn-back" onClick={() => setSubStep(0)}>← Quay lại</button>
                <button className="pf-btn-pay" onClick={pay} disabled={paying}>
                  {paying ? <>⏳ Đang xử lý...</> : <>🔒 Thanh toán {fmt(total)}</>}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}