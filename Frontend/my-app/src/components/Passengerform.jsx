// PassengerForm.jsx — Điền thông tin hành khách & thanh toán qua VNPay sandbox
// Luồng: Nhập HK → POST /api/createBooking → GET /api/payments/vnpay/{id} → redirect VNPay
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, isTokenExpired } from '../services/keycloakService';
import '../styles/Passenger.css';
import '../styles/Refundpolicy.css';

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api';

// ── Auth helper — lấy token từ sessionStorage qua keycloakService ─────────────
function getAuthHeaders(includeContentType = true) {
  const token = getToken(); // sessionStorage.getItem('access_token')
  if (!token || isTokenExpired()) {
    throw new Error('TOKEN_MISSING');
  }
  const headers = {
    'Accept':        'application/json',
    'Authorization': `Bearer ${token}`,
  };
  if (includeContentType) headers['Content-Type'] = 'application/json';
  return headers;
}

function fmt(n) { return Number(n || 0).toLocaleString("vi-VN") + "₫"; }

function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function lettersOnly(value) {
  return String(value ?? '').replace(/[0-9]/g, '');
}

function preventNonDigitKeyDown(e) {
  const allowKeys = [
    'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
  ];

  if (e.ctrlKey || e.metaKey || allowKeys.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}

function handleDigitPaste(e, applyValue, maxLength = Infinity) {
  e.preventDefault();
  const pasted = e.clipboardData?.getData('text') ?? '';
  applyValue(digitsOnly(pasted).slice(0, maxLength));
}

function preventDigitKeyDown(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^\d$/.test(e.key)) e.preventDefault();
}

function handleTextPasteWithoutDigits(e, applyValue) {
  e.preventDefault();
  const pasted = e.clipboardData?.getData('text') ?? '';
  applyValue(lettersOnly(pasted));
}

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
function RefundPolicyModal({ flight, onClose, onAgree }) {
  // Lược bỏ hoàn toàn các state scrollPct và hasScrolledToEnd

  const sections = [
    {
      id: 1,
      title: "Điều kiện thay đổi",
      items: [
        { label: "Hoàn vé", value: flight?.refund || 'Theo quy định hạng vé' },
        { label: "Đổi vé", value: flight?.exchange || 'Áp dụng phí đổi + chênh lệch' }
      ]
    },
    {
      id: 2,
      title: "Hành lý & Dịch vụ",
      items: [
        { label: "Hành lý xách tay", value: flight?.baggage || '07kg tiêu chuẩn' },
        { label: "Hành lý ký gửi", value: flight?.checkin || 'Chưa bao gồm' }
      ]
    }
  ];

  return (
    <div className="rpm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rpm-box">
        <div className="rpm-topbar" />
        
        <div className="rpm-header">
          <div className="rpm-title-area" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '20px' }}>📋</span>
            <span style={{ marginLeft: '10px', fontWeight: 700 }}>Chính sách & Điều khoản</span>
          </div>
          <button className="rpm-close" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        {/* Bỏ ref và onScroll, chỉ giữ lại vùng chứa nội dung */}
        <div className="rpm-content" style={{ padding: '24px', overflowY: 'auto', maxHheight: '400px' }}>
          <div className="rpm-alert-box" style={{ background: '#f0fafa', padding: '12px', borderRadius: '8px', color: '#1e8888', marginBottom: '20px', borderLeft: '4px solid #2aabab' }}>
            Thông tin chi tiết cho chuyến bay <strong>{flight?.flightNo}</strong>.
          </div>

          {sections.map(sec => (
            <div key={sec.id} className="rpm-section" style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#2aabab', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{sec.id}</span>
                {sec.title}
              </div>
              <div style={{ paddingLeft: '30px' }}>
                {sec.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: '#5a7a7a' }}>{item.label}</span>
                    <strong style={{ color: '#1a2a2a' }}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rpm-footer" style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fafafa' }}>
          <button 
            className="rpm-btn-cancel" 
            onClick={onClose}
            style={{ padding: '10px 20px', border: 'none', background: 'transparent', color: '#666', fontWeight: 600, cursor: 'pointer' }}
          >
            Đóng
          </button>
          <button 
            className="rpm-btn-confirm active" // Luôn ở trạng thái active
            onClick={() => { onAgree?.(); onClose(); }}
            style={{ 
              padding: '10px 24px', 
              backgroundColor: '#2aabab', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(42,171,171,0.2)'
            }}
          >
            ✓ Tôi đã hiểu & Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
} 
function MiniCalendar({ value, onChange, onClose }) {
  const today = new Date()
  const init = value ? new Date(value) : today
  const [yr, setYr] = useState(init.getFullYear())
  const [mo, setMo] = useState(init.getMonth())
  const currentYear = today.getFullYear()
  const years = Array.from({ length: 101 }, (_, idx) => currentYear - idx)

  const firstDay = new Date(yr, mo, 1).getDay()
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const pad = cells.length % 7 ? 7 - (cells.length % 7) : 0
  for (let i = 0; i < pad; i++) cells.push(null)

  const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
  const DOWS   = ['CN','T2','T3','T4','T5','T6','T7']

  function prev() { mo === 0 ? (setYr(y => y-1), setMo(11)) : setMo(m => m-1) }
  function next() { mo === 11 ? (setYr(y => y+1), setMo(0)) : setMo(m => m+1) }

  function pick(d) {
    if (!d) return
    const date = new Date(yr, mo, d)
    if (date > today) return
    const iso = `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    onChange(iso)
    onClose()
  }

  const selD = value ? new Date(value) : null

  function cls(d) {
    if (!d) return 'cal-day cal-day--empty'
    const date = new Date(yr, mo, d)
    const isFuture = date > new Date(today.toDateString())
    const isSel  = selD && selD.getFullYear()===yr && selD.getMonth()===mo && selD.getDate()===d
    const isToday= today.getFullYear()===yr && today.getMonth()===mo && today.getDate()===d
    return ['cal-day', isFuture&&'cal-day--past', isSel&&'cal-day--selected', (!isSel&&isToday)&&'cal-day--today'].filter(Boolean).join(' ')
  }

  return (
    <div className="cal-wrap" onClick={e => e.stopPropagation()}>
      <div className="cal-nav">
        <button className="cal-nav__btn" onClick={prev}>‹</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            className="form-field__select"
            value={mo}
            onChange={e => setMo(Number(e.target.value))}
            style={{ minWidth: 112, padding: '6px 10px' }}
          >
            {MONTHS.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          <select
            className="form-field__select"
            value={yr}
            onChange={e => setYr(Number(e.target.value))}
            style={{ minWidth: 96, padding: '6px 10px' }}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <button className="cal-nav__btn" onClick={next}>›</button>
      </div>
      <div className="cal-grid">
        {DOWS.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={cls(d)} onClick={() => pick(d)}>{d || ''}</div>
        ))}
      </div>
    </div>
  )
}

 function VNPayWaiting({ vnpayUrl, onRefreshStatus, checkingStatus, paymentStatus, onGoHome }) {
  return (
    <div className="vnp-waiting">
      <div className="vnp-waiting__icon-wrap">
        <svg viewBox="0 0 56 56" fill="none" width="56" height="56">
          <rect width="56" height="56" rx="14" fill="url(#vnpw-g)" />
          <text
            x="50%"
            y="54%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#fff"
            fontSize="14"
            fontWeight="800"
            fontFamily="sans-serif"
          >
            VNP
          </text>
          <defs>
            <linearGradient id="vnpw-g" x1="0" y1="0" x2="56" y2="56">
              <stop stopColor="#00bfa8" />
              <stop offset="1" stopColor="#007869" />
            </linearGradient>
          </defs>
        </svg>

        {/* Pulse ring */}
        <div className="vnp-waiting__pulse" />
      </div>

      <div className="vnp-waiting__content">
        <div className="vnp-waiting__title">Đang chờ thanh toán...</div>
        <div className="vnp-waiting__sub">
          Trang thanh toán VNPay đã được mở trong tab mới.
          <br />
          Trang này sẽ tự cập nhật sau khi bạn hoàn tất.
        </div>
      </div>

      {paymentStatus?.message && (
        <div className={`vnp-waiting__status vnp-waiting__status--${paymentStatus.type || 'info'}`}>
          {paymentStatus.message}
        </div>
      )}

      <div className="vnp-waiting__steps">
        <div className="vnp-waiting__step vnp-waiting__step--done">
          <span className="vnp-waiting__step-dot">✓</span>
          Giữ chỗ thành công
        </div>

        <div className="vnp-waiting__step vnp-waiting__step--active">
          <span className="vnp-waiting__step-dot vnp-waiting__step-dot--spin">
            ⟳
          </span>
          Chờ xác nhận thanh toán
        </div>

        <div className="vnp-waiting__step vnp-waiting__step--idle">
          <span className="vnp-waiting__step-dot">○</span>
          Xác nhận vé
        </div>
      </div>

      <div className="vnp-waiting__actions">
        <button
          className="vnp-waiting__reopen"
          onClick={() => {
            if (vnpayUrl) {
              window.open(vnpayUrl, "_blank");
            } else {
              alert("Không có link thanh toán");
            }
          }}
        >
          Mở lại trang thanh toán →
        </button>

        <button
          type="button"
          className="vnp-waiting__refresh"
          onClick={onRefreshStatus}
          disabled={checkingStatus}
        >
          {checkingStatus ? 'Đang tải lại...' : 'Tải lại trạng thái thanh toán'}
        </button>

        <button
          type="button"
          className="vnp-waiting__home"
          onClick={onGoHome}
        >
          Trở về màn hình chính
        </button>
      </div>

      <div className="vnp-sandbox-badge">
        🧪 Môi trường Sandbox
      </div>
    </div>
  );
}
// ── Main ──────────────────────────────────────────────────────────────────────
export default function PassengerForm({
  flight = {
    airline: "VietJet Air", code: "VJ",
    dep: "09:30", arr: "11:45", duration: "2g15p",
    price: 890000, class: "Phổ thông",
    seat_class: "ECONOMY",
    refund: "Không hoàn", exchange: "Phí 300.000₫",
    baggage: "1 xách tay 7kg", checkin: "Không (có thể mua thêm)",
    flightNo: "VJ-134", depCode: "HAN", arrCode: "SGN",
    logoColor: "#e5002b", logoText: "#fff",
  },
  selectedFlights = [],
  searchData = { from: "HAN", to: "SGN", date: "2026-04-01", passengers: "2" },
  onBack = () => {},
  onDone = () => {},
}) {
  const navigate = useNavigate()
  const pax = parseInt(searchData.passengers) || 1;
  const itineraryFlights = selectedFlights.length > 0
    ? selectedFlights.filter(Boolean)
    : [flight].filter(Boolean)
  const totalFlightPrice = itineraryFlights.reduce((sum, item) => sum + (Number(item?.price) || 0), 0)

  const [subStep, setSubStep]       = useState(0);
  const [forms, setForms]           = useState(() =>
    Array.from({ length: pax }, () => ({ first_name: '', last_name: '', date_of_birth: '', id_number: '', gender: 'MALE' }))
  );
  const [contact, setContact]       = useState({ email: '', phone: '' });
  const [policyRead, setPolicyRead] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const [booking, setBooking]       = useState(null);
  const [apiError, setApiError]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying]         = useState(false);
  const [vnpayUrl, setVnpayUrl]     = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus]   = useState(null);
const [openCalIndex, setOpenCalIndex] = useState(null);
  function updForm(i, field, val) {
    setForms(p => p.map((f, idx) => idx === i ? { ...f, [field]: val } : f));
  }

  async function refreshPaymentStatus() {
    if (!booking?.pnr || !booking?.contact_email) {
      setApiError('Không đủ thông tin để tải lại trạng thái thanh toán.');
      return false;
    }

    setCheckingStatus(true);
    setApiError('');
    setPaymentStatus(null);

    try {
      const res = await fetch(`${API_BASE}/bookings/search-tickets`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pnr: booking.pnr,
          email: booking.contact_email,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json?.success) {
        const tickets = Array.isArray(json?.data) ? json.data : [];
        if (tickets.length > 0) {
          setBooking(prev => prev ? { ...prev, status: 'PAID', expires_at: null, tickets } : prev);
          setPaymentStatus({
            type: 'success',
            message: 'Thanh toán thành công. Hệ thống đã ghi nhận vé của bạn.',
          });
          return true;
        }
      }

      setPaymentStatus({
        type: 'pending',
        message: 'Chưa ghi nhận thay đổi trạng thái thanh toán. Vui lòng thử lại sau ít phút.',
      });
      return false;
    } catch (err) {
      setApiError(err.message || 'Chưa thể tải lại trạng thái thanh toán.');
      return false;
    } finally {
      setCheckingStatus(false);
    }
  }

  useEffect(() => {
    if (!booking?.id) return;

    const params = new URLSearchParams(window.location.search);
    const responseCode = params.get('vnp_ResponseCode');
    const txnRef = params.get('vnp_TxnRef') ?? '';

    if (!responseCode || (txnRef && !txnRef.startsWith(`${booking.id}_`))) return;

    if (responseCode === '00') {
      setPaymentStatus({
        type: 'success',
        message: 'VNPay đã báo thanh toán thành công. Đang đồng bộ lại trạng thái vé...',
      });
      refreshPaymentStatus();
      return;
    }

    setPaymentStatus({
      type: 'error',
      message: `Thanh toán thất bại. Mã phản hồi VNPay: ${responseCode}.`,
    });
  }, [booking?.id]);

  useEffect(() => {
    if (!vnpayUrl || !booking?.pnr || checkingStatus || paymentStatus?.type === 'success') return;

    const timer = window.setInterval(() => {
      refreshPaymentStatus();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [vnpayUrl, booking?.pnr, checkingStatus, paymentStatus?.type]);

  function getFormValidationError() {
    if (!contact.email.trim()) return 'Vui lòng nhập email nhận vé.'
    if (!contact.phone.trim()) return 'Vui lòng nhập số điện thoại.'

    for (let i = 0; i < forms.length; i += 1) {
      const f = forms[i]
      const index = i + 1

      if (!f.last_name.trim()) return `Vui lòng nhập họ cho hành khách ${index}.`
      if (!f.first_name.trim()) return `Vui lòng nhập tên cho hành khách ${index}.`
      if (!f.date_of_birth) return `Vui lòng chọn ngày sinh cho hành khách ${index}.`
      if (!f.id_number.trim()) return `Vui lòng nhập căn cước công dân cho hành khách ${index}.`
      if (!f.gender) return `Vui lòng chọn giới tính cho hành khách ${index}.`
    }

    return ''
  }

  const formFieldsValid = !getFormValidationError()

  // ── BƯỚC 0 → 1: POST /api/createBooking ──────────────────────────────────
  async function handleCreateBooking() {
    const validationError = getFormValidationError()
    if (validationError) {
      setApiError(validationError)
      return
    }
    if (!policyRead) {
      setApiError('Vui lòng đọc và đồng ý với chính sách hoàn vé trước khi tiếp tục.');
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      const res = await fetch(`${API_BASE}/createBooking`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          contact_email: contact.email.trim(),
          contact_phone: contact.phone.trim(),
          itinerary: itineraryFlights.map(item => ({
            flight_instance_id: item.id,
            description: `${item.depCode} - ${item.arrCode}`,
            seat_class: item.seat_class || 'ECONOMY',
          })),
          passengers: forms.map(f => ({
            first_name: f.first_name.trim(),
            last_name:  f.last_name.trim(),
            date_of_birth: f.date_of_birth || undefined,
            id_number:  f.id_number.trim() || undefined,
            gender:     f.gender,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || `Lỗi ${res.status}`);
      setBooking(json.data);
      // Gọi onDone để component cha chuyển sang màn AddonsService
      // Truyền booking để sau khi chọn addon xong biết booking_id để thanh toán
      onDone?.({
        booking: json.data,
        ticket_id: json.data?.tickets?.[0]?.id ?? json.data?.id ?? null,
      });
    } catch (err) {
      setApiError(
        err.message === 'TOKEN_MISSING'
          ? '🔐 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
          : err.message || 'Đặt chỗ thất bại. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── BƯỚC 1: GET /api/payments/vnpay/{id} → redirect ──────────────────────
  async function handleVNPayRedirect() {
    if (!booking?.id) return;
    setPaying(true);
    setApiError('');
    try {
      const res = await fetch(`${API_BASE}/payments/vnpay/${booking.id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || `Lỗi ${res.status}`);

      const url = json.data;
      if (!url?.startsWith('http')) throw new Error('URL thanh toán không hợp lệ');

      setVnpayUrl(url);
      setPaymentStatus({
        type: 'pending',
        message: 'Sau khi thanh toán xong ở tab VNPay, bấm "Tải lại trạng thái thanh toán" để cập nhật.',
      });
      // Mở VNPay sandbox trong tab mới, trang hiện tại giữ nguyên chờ kết quả
      setTimeout(() => { window.open(url, '_blank'); }, 800);
    } catch (err) {
      setApiError(
        err.message === 'TOKEN_MISSING'
          ? '🔐 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
          : err.message || 'Không lấy được link thanh toán. Vui lòng thử lại.'
      );
      setPaying(false);
    }
    // Không setPaying(false) khi success — overlay giữ đến khi redirect
  }

// ─── Step indicator — 3 bước: Thông tin (active) → Dịch vụ → Thanh toán ───
const STEPS = ['Thông tin', 'Dịch vụ', 'Thanh toán']

function StepBar({ active }) {
  return (
    <div className="pf-steps">
      {STEPS.map((label, i) => {
        const state = i < active ? 'done' : i === active ? 'active' : 'idle'
        return (
          <>
            <div className="pf-step" key={i}>
              <div className={`pf-step__circle pf-step__circle--${state}`}>
                {state === 'done' ? '✓' : i + 1}
              </div>
              <span className={`pf-step__label${state === 'active' ? ' pf-step__label--active' : ''}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`pf-step-line${state === 'done' ? ' pf-step-line--done' : ''}`} key={`line-${i}`} />
            )}
          </>
        )
      })}
    </div>
  )
}

  // ── Redirect overlay ──────────────────────────────────────────────────────
  // Không replace toàn trang — hiện banner chờ ngay trong layout

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

          <StepBar active={0} />

          {/* Flight pill */}
          <div className="pf-flight-pill">
            <span>✈️ {itineraryFlights[0]?.airline || flight.airline}</span>
            <span className="pf-flight-pill__sep">·</span>
            <span>{searchData.from} → {searchData.to}</span>
            <span className="pf-flight-pill__sep">·</span>
            <span>{fmtDate(searchData.date)}</span>
            {searchData.tripType === 'round' && searchData.retDate && (
              <>
                <span className="pf-flight-pill__sep">·</span>
                <span>Về {fmtDate(searchData.retDate)}</span>
              </>
            )}
            <span className="pf-flight-pill__sep">·</span>
            <span>{pax} khách</span>
            <span className="pf-flight-pill__price">{fmt(totalFlightPrice * pax)}</span>
          </div>

          {itineraryFlights.length > 1 && (
            <div className="pf-card" style={{ marginBottom: 16 }}>
              <div className="pf-card__title">
                <span className="pf-card__title-icon">🛫</span>
                Hành trình đã chọn
              </div>
              {itineraryFlights.map((item, index) => (
                <div key={`${item.id}-${index}`} className="pf-ticket-row">
                  <div className="pf-ticket-row__pax">
                    {index === 0 ? 'Lượt đi' : 'Lượt về'}
                  </div>
                  <div className="pf-ticket-row__flight">
                    {item.depCode} → {item.arrCode}
                    {' · '}
                    {item.dep} - {item.arr}
                    {' · '}
                    <span className={`pf-class-tag pf-class-tag--${(item.seat_class || '').toLowerCase()}`}>
                      {item.seat_class === 'BUSINESS' ? '👑 Thương gia' : '💺 Phổ thông'}
                    </span>
                  </div>
                  <div className="pf-ticket-row__price">{fmt(item.price * pax)}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── BƯỚC 0: Nhập thông tin ── */}
          {subStep === 0 && (
            <>
              {/* Thông tin liên hệ */}
              <div className="pf-card">
                <div className="pf-card__title">
                  <span className="pf-card__title-icon">📬</span>
                  Thông tin liên hệ
                </div>
                <div className="pf-grid-2">
                  <div className="pf-field">
                    <label>Email nhận vé <span className="pf-req">*</span></label>
                    <input
                      type="email" placeholder="email@example.com"
                      value={contact.email}
                      onChange={e => {
                        setContact(c => ({ ...c, email: e.target.value }))
                        if (apiError) setApiError('')
                      }}
                    />
                  </div>
                  <div className="pf-field">
                    <label>Số điện thoại <span className="pf-req">*</span></label>
                    <input
                      type="text" placeholder="09xxxxxxxx"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={contact.phone}
                      onKeyDown={preventNonDigitKeyDown}
                      onPaste={e => handleDigitPaste(e, value => {
                        setContact(c => ({ ...c, phone: value }))
                        if (apiError) setApiError('')
                      }, 10)}
                      onChange={e => {
                        setContact(c => ({ ...c, phone: digitsOnly(e.target.value).slice(0, 10) }))
                        if (apiError) setApiError('')
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Từng hành khách */}
              {forms.map((f, i) => (
                <div className="pf-card" key={i}>
                  <div className="pf-card__title">
                    <span className="pf-card__title-icon">👤</span>
                    Hành khách {i + 1}
                    <span className="pf-card__title-sub"> · Người lớn</span>
                  </div>
                  <div className="pf-grid-2">
                    <div className="pf-field">
                      <label>Họ <span className="pf-req">*</span></label>
                      <input placeholder="VD: Nguyễn" value={f.last_name}
                        onKeyDown={preventDigitKeyDown}
                        onPaste={e => handleTextPasteWithoutDigits(e, value => {
                          updForm(i, 'last_name', value)
                          if (apiError) setApiError('')
                        })}
                        onChange={e => {
                          updForm(i, 'last_name', lettersOnly(e.target.value))
                          if (apiError) setApiError('')
                        }} />
                    </div>
                    <div className="pf-field">
                      <label>Tên <span className="pf-req">*</span></label>
                      <input placeholder="VD: Văn A" value={f.first_name}
                        onKeyDown={preventDigitKeyDown}
                        onPaste={e => handleTextPasteWithoutDigits(e, value => {
                          updForm(i, 'first_name', value)
                          if (apiError) setApiError('')
                        })}
                        onChange={e => {
                          updForm(i, 'first_name', lettersOnly(e.target.value))
                          if (apiError) setApiError('')
                        }} />
                    </div>
                   <div className="pf-field" style={{ position: 'relative' }}>
                <label>Ngày sinh <span className="pf-req">*</span></label>

                <div
                  className="form-field__input"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onClick={() => setOpenCalIndex(i)}
                >
                  <span>📅</span>
                  <span style={{ color: f.date_of_birth ? 'inherit' : '#9ca3af' }}>
                    {f.date_of_birth
                      ? f.date_of_birth.split('-').reverse().join('/')
                      : 'Chọn ngày'}
                  </span>
                </div>

                {openCalIndex === i && (
                  <>
                    {/* overlay click ra ngoài để đóng */}
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100
                      }}
                      onClick={() => setOpenCalIndex(null)}
                    />

                    <MiniCalendar
                      value={f.date_of_birth}
                      onChange={(date) => {
                        updForm(i, 'date_of_birth', date)
                        if (apiError) setApiError('')
                      }}
                      onClose={() => setOpenCalIndex(null)}
                    />
                  </>
                )}
              </div>
                    <div className="pf-field">
                      <label>Căn cước công dân <span className="pf-req">*</span></label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={12}
                        placeholder="VD: 001234567890"
                        value={f.id_number}
                        onKeyDown={preventNonDigitKeyDown}
                        onPaste={e => handleDigitPaste(e, value => {
                          updForm(i, 'id_number', value)
                          if (apiError) setApiError('')
                        }, 12)}
                        onChange={e => {
                          updForm(i, 'id_number', digitsOnly(e.target.value).slice(0, 12))
                          if (apiError) setApiError('')
                        }}
                      />
                    </div>
                    <div className="pf-field">
                      <label>Giới tính <span className="pf-req">*</span></label>
                      <select value={f.gender}
                        onChange={e => {
                          updForm(i, 'gender', e.target.value)
                          if (apiError) setApiError('')
                        }}>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {/* Chính sách */}
              <div className="pf-policy-row">
                <button className={`pf-policy-btn${policyRead ? " read" : ""}`}
                  onClick={() => {
                    if (apiError) setApiError('')
                    setShowPolicy(true)
                  }}>
                  {policyRead ? "✓ Đã xem" : "📋 Chính sách hoàn vé"}
                </button>
                <div className="pf-policy-note">
                  {policyRead
                    ? <><span className="pf-policy-check">✓</span> Bạn đã đọc và đồng ý với chính sách hoàn vé</>
                    : "Vui lòng đọc chính sách hoàn vé trước khi tiếp tục"}
                </div>
              </div>

                {apiError && <div className="pf-error">⚠️ {apiError}</div>}

              <div className="pf-btn-row">
                <button className="pf-btn-back" onClick={onBack}>← Quay lại</button>
                <button className="pf-btn-next" disabled={submitting}
                  onClick={handleCreateBooking}>
                  {submitting
                    ? <><span className="pf-spinner-sm" /> Đang giữ chỗ...</>
                    : 'Tiếp tục →'}
                </button>
              </div>
            </>
          )}

          {/* ── BƯỚC 1: Xác nhận & Thanh toán ── */}
          {subStep === 1 && booking && (
            <>
              {/* Khi đã mở tab VNPay → hiện banner chờ, ẩn nút thanh toán */}
              {vnpayUrl ? (
                <VNPayWaiting
                  vnpayUrl={vnpayUrl}
                  onRefreshStatus={refreshPaymentStatus}
                  checkingStatus={checkingStatus}
                  paymentStatus={paymentStatus}
                  onGoHome={() => navigate('/home')}
                />
              ) : (
              <>
              {/* PNR badge */}
              <div className="pf-pnr-card">
                <div className="pf-pnr-card__label">Mã đặt chỗ (PNR)</div>
                <div className="pf-pnr-card__code">{booking.pnr}</div>
                <div className="pf-pnr-card__status">
                  <span className="pf-status-dot pf-status-dot--pending" />
                  Giữ chỗ thành công · Chờ thanh toán
                </div>
                <div className="pf-pnr-card__expire">
                  ⏳ Hết hạn lúc{' '}
                  <b>{new Date(booking.expires_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</b>
                  {' '}ngày {new Date(booking.expires_at).toLocaleDateString('vi-VN')}
                </div>
              </div>

              {/* Chi tiết vé */}
              <div className="pf-card">
                <div className="pf-card__title">
                  <span className="pf-card__title-icon">🎫</span>Chi tiết vé
                </div>
                {booking.tickets?.map(t => (
                  <div key={t.id} className="pf-ticket-row">
                    <div className="pf-ticket-row__pax">
                      👤 {t.passenger.last_name} {t.passenger.first_name}
                      <span className="pf-ticket-row__gender">
                        {t.passenger.gender === 'MALE' ? ' · Nam' : ' · Nữ'}
                      </span>
                    </div>
                    <div className="pf-ticket-row__flight">
                      {t.flight_instance?.route?.origin?.code} →{' '}
                      {t.flight_instance?.route?.destination?.code}
                      {' · '}
                      <span className={`pf-class-tag pf-class-tag--${(t.seat_class || '').toLowerCase()}`}>
                        {t.seat_class === 'BUSINESS' ? '👑 Thương gia' : '💺 Phổ thông'}
                      </span>
                    </div>
                    <div className="pf-ticket-row__price">{fmt(t.ticket_price)}</div>
                  </div>
                ))}
              </div>

              {/* Tổng tiền */}
              <div className="pf-card">
                <div className="pf-card__title">
                  <span className="pf-card__title-icon">💰</span>Tổng chi phí
                </div>
                <div className="pf-price-table">
                  <div className="pf-price-row">
                    <span>Tổng tiền vé ({pax} vé)</span>
                    <b>{fmt(booking.total_amount)}</b>
                  </div>
                  <div className="pf-price-total">
                    <span>Thanh toán ngay</span>
                    <span>{fmt(booking.total_amount)}</span>
                  </div>
                </div>
              </div>

              {apiError && <div className="pf-error">⚠️ {apiError}</div>}

              {/* Nút VNPay */}
              <div className="pf-btn-row pf-btn-row--pay">
                <button className="pf-btn-back"
                  onClick={() => { setSubStep(0); setBooking(null); setApiError(''); }}>
                  ← Quay lại
                </button>
                <button className="pf-btn-vnpay" onClick={handleVNPayRedirect} disabled={paying}>
                  {paying ? (
                    <><span className="pf-spinner-sm pf-spinner-sm--white" /> Đang lấy link...</>
                  ) : (
                    <>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{flexShrink:0}}>
                        <rect width="22" height="22" rx="5" fill="#fff" fillOpacity=".25"/>
                        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
                          fill="#fff" fontSize="7" fontWeight="800" fontFamily="sans-serif">VNP</text>
                      </svg>
                      Thanh toán {fmt(booking.total_amount)} qua VNPay
                    </>
                  )}
                </button>
              </div>

              <p className="pf-vnpay-note">
                🔒 Bạn sẽ được chuyển đến trang thanh toán an toàn của VNPay Sandbox.
                Sau khi hoàn tất, hệ thống sẽ tự động xác nhận vé.
              </p>
              </>
              )} {/* end vnpayUrl ? ... : ... */}
            </>
          )}

        </div>
      </div>

      {/* CSS bổ sung cho elements mới */}
      <style>{`
        @keyframes vnp-spin { to { transform: rotate(360deg); } }
        @keyframes vnp-pulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.18);opacity:.15} }

        /* ── VNPay Waiting Banner ── */
        .vnp-waiting {
          background: linear-gradient(135deg, #f0fdf9, #e6f7f5);
          border: 1.5px solid #5eead4;
          border-radius: 16px;
          padding: 28px 24px;
          margin-bottom: 16px;
          display: flex; flex-direction: column; align-items: center;
          gap: 14px; text-align: center;
        }
        .vnp-waiting__icon-wrap { position: relative; display: inline-flex; }
        .vnp-waiting__pulse {
          position: absolute; inset: -8px;
          border-radius: 20px;
          background: rgba(0,191,168,.25);
          animation: vnp-pulse 1.8s ease-in-out infinite;
          pointer-events: none;
        }
        .vnp-waiting__title { font-size: 18px; font-weight: 800; color: #065f46; }
        .vnp-waiting__sub   { font-size: 13px; color: #047857; line-height: 1.6; }
        .vnp-waiting__status {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
        }
        .vnp-waiting__status--success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }
        .vnp-waiting__status--pending,
        .vnp-waiting__status--info {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        .vnp-waiting__status--error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .vnp-waiting__steps {
          display: flex; gap: 0; align-items: center;
          background: #fff; border-radius: 10px;
          padding: 12px 16px; width: 100%; box-sizing: border-box;
          border: 1px solid #d1fae5;
        }
        .vnp-waiting__step {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; flex: 1;
          justify-content: center; position: relative;
        }
        .vnp-waiting__step + .vnp-waiting__step::before {
          content: ''; position: absolute; left: 0; top: 50%;
          transform: translateY(-50%);
          width: 1px; height: 24px; background: #d1fae5;
        }
        .vnp-waiting__step--done  { color: #059669; }
        .vnp-waiting__step--active{ color: #0891b2; }
        .vnp-waiting__step--idle  { color: #9ca3af; }
        .vnp-waiting__step-dot { font-size: 14px; }
        .vnp-waiting__step-dot--spin {
          display: inline-block;
          animation: vnp-spin .9s linear infinite;
        }
        .vnp-waiting__actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .vnp-waiting__reopen {
          background: #009B8D; color: #fff;
          border: none; border-radius: 8px;
          padding: 10px 20px; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: background .15s, transform .12s;
        }
        .vnp-waiting__reopen:hover { background: #007869; transform: translateY(-1px); }
        .vnp-waiting__refresh {
          background: #fff;
          color: #0f766e;
          border: 1.5px solid #0f766e;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s, transform .12s, opacity .15s;
        }
        .vnp-waiting__refresh:hover:not(:disabled) { background: #f0fdfa; transform: translateY(-1px); }
        .vnp-waiting__refresh:disabled { opacity: .65; cursor: not-allowed; }
        .vnp-waiting__home {
          background: #ffffff;
          color: #1f2937;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s, transform .12s, border-color .15s;
        }
        .vnp-waiting__home:hover {
          background: #f9fafb;
          border-color: #9ca3af;
          transform: translateY(-1px);
        }

        .vnp-sandbox-badge {
          font-size: 11px; font-weight: 600;
          background: #fff8e1; color: #b45309;
          border: 1px solid #fde68a; padding: 3px 10px; border-radius: 20px;
        }

        .pf-pnr-card {
          background: linear-gradient(135deg,#f0fdf9,#e6f7f5);
          border: 1.5px solid #a7f3d0; border-radius: 14px;
          padding: 20px 24px; margin-bottom: 14px; text-align: center;
        }
        .pf-pnr-card__label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #059669; margin-bottom: 6px; }
        .pf-pnr-card__code  { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #065f46; font-family: 'Courier New', monospace; }
        .pf-pnr-card__status { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: #374151; margin-top: 8px; }
        .pf-pnr-card__expire { font-size: 12px; color: #d97706; margin-top: 6px; }
        .pf-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .pf-status-dot--pending { background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.2); animation: pulse-dot 1.5s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 3px rgba(245,158,11,.2)} 50%{box-shadow:0 0 0 6px rgba(245,158,11,.08)} }

        .pf-ticket-row {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          padding: 10px 0; border-bottom: 1px solid #f0f0f0;
        }
        .pf-ticket-row:last-child { border-bottom: none; }
        .pf-ticket-row__pax   { flex: 1; font-size: 14px; font-weight: 600; color: #111; min-width: 140px; }
        .pf-ticket-row__gender { font-weight: 400; color: #888; font-size: 13px; }
        .pf-ticket-row__flight { font-size: 13px; color: #555; }
        .pf-ticket-row__price  { margin-left: auto; font-size: 14px; font-weight: 700; color: #1a3c6e; white-space: nowrap; }
        .pf-class-tag { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
        .pf-class-tag--economy  { background: #eff6ff; color: #1d4ed8; }
        .pf-class-tag--business { background: #fffbeb; color: #92400e; }

        .pf-btn-vnpay {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #00bfa8, #007869);
          color: #fff; border: none; border-radius: 10px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          transition: opacity .15s, transform .12s, box-shadow .15s;
          box-shadow: 0 4px 18px rgba(0,155,141,.35); white-space: nowrap;
        }
        .pf-btn-vnpay:hover:not(:disabled) { opacity:.92; transform:translateY(-1px); box-shadow:0 6px 22px rgba(0,155,141,.45); }
        .pf-btn-vnpay:active:not(:disabled) { transform:translateY(0); }
        .pf-btn-vnpay:disabled { opacity:.55; cursor:not-allowed; }

        .pf-vnpay-note { text-align:center; font-size:12px; color:#888; margin-top:6px; line-height:1.6; }

        .pf-spinner-sm {
          display:inline-block; width:14px; height:14px;
          border:2px solid rgba(26,60,110,.2); border-top-color:#1a3c6e;
          border-radius:50%; animation:vnp-spin .7s linear infinite;
          vertical-align:middle; margin-right:4px;
        }
        .pf-spinner-sm--white { border-color:rgba(255,255,255,.3); border-top-color:#fff; }
        .pf-error {
          background:#fef2f2; border:1px solid #fecaca; color:#dc2626;
          border-radius:8px; padding:10px 14px; font-size:13px; margin-bottom:12px;
        }
        .pf-req { color:#e53e3e; }
        .pf-card__title-sub { font-size:12px; font-weight:400; color:#888; }
        .pf-btn-row--pay { margin-top:8px; }
        @media (max-width: 720px) {
          .vnp-waiting__steps {
            flex-direction: column;
            gap: 10px;
          }
          .vnp-waiting__step + .vnp-waiting__step::before {
            display: none;
          }
          .vnp-waiting__actions {
            width: 100%;
            flex-direction: column;
          }
          .vnp-waiting__reopen,
          .vnp-waiting__refresh,
          .vnp-waiting__home {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
