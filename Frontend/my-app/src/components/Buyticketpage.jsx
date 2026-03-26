// src/pages/BuyTicketPage.jsx
// Luồng đầy đủ: PassengerForm → AddonsService → Thanh toán VNPay
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PassengerForm from '../components/Passengerform';
import AddonsService from '../components/checkin/AddonsService';
import { getToken, isTokenExpired } from '../services/keycloakService';

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api';

function getAuthHeaders() {
  const token = getToken();
  if (!token || isTokenExpired()) throw new Error('TOKEN_MISSING');
  return {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

function fmt(n) { return Number(n || 0).toLocaleString('vi-VN') + '₫'; }

// ── Màn thanh toán VNPay ─────────────────────────────────────────────────────
function PaymentStep({ booking, addonTotal = 0, onBack }) {
  const [paying,   setPaying]   = useState(false);
  const [vnpayUrl, setVnpayUrl] = useState(null);
  const [apiError, setApiError] = useState('');

  const grandTotal = (booking.total_amount || 0) + addonTotal;

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
      setTimeout(() => window.open(url, '_blank'), 800);
    } catch (err) {
      setApiError(
        err.message === 'TOKEN_MISSING'
          ? '🔐 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
          : err.message || 'Không lấy được link thanh toán. Vui lòng thử lại.'
      );
      setPaying(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px', fontFamily: 'sans-serif' }}>
      {/* PNR */}
      <div style={{
        background: 'linear-gradient(135deg,#f0fdf9,#e6f7f5)',
        border: '1.5px solid #a7f3d0', borderRadius: 14,
        padding: '20px 24px', marginBottom: 20, textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#059669', marginBottom: 6 }}>
          Mã đặt chỗ (PNR)
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 6, color: '#065f46', fontFamily: 'Courier New, monospace' }}>
          {booking.pnr}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: '#374151', marginTop: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
          Giữ chỗ thành công · Chờ thanh toán
        </div>
        {booking.expires_at && (
          <div style={{ fontSize: 12, color: '#d97706', marginTop: 6 }}>
            ⏳ Hết hạn lúc{' '}
            <b>{new Date(booking.expires_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</b>
            {' '}ngày {new Date(booking.expires_at).toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>

      {/* Tổng tiền */}
      <div style={{
        background: '#fff', border: '1.5px solid #e5e7eb',
        borderRadius: 12, padding: '16px 20px', marginBottom: 20,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>💰 Tổng chi phí</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', marginBottom: 8 }}>
          <span>Tiền vé</span>
          <b>{fmt(booking.total_amount)}</b>
        </div>
        {addonTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', marginBottom: 8 }}>
            <span>Dịch vụ bổ sung</span>
            <b style={{ color: '#2aabab' }}>+{fmt(addonTotal)}</b>
          </div>
        )}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontWeight: 800, fontSize: 18, color: '#1a2a2a',
          paddingTop: 12, borderTop: '1.5px solid #e5e7eb',
        }}>
          <span>Thanh toán</span>
          <span style={{ color: '#2aabab' }}>{fmt(grandTotal)}</span>
        </div>
      </div>

      {/* VNPay waiting */}
      {vnpayUrl && (
        <div style={{
          background: 'linear-gradient(135deg,#f0fdf9,#e6f7f5)',
          border: '1.5px solid #5eead4', borderRadius: 16,
          padding: '24px 20px', marginBottom: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#065f46', marginBottom: 6 }}>
            ⏳ Đang chờ thanh toán...
          </div>
          <div style={{ fontSize: 13, color: '#047857', marginBottom: 14 }}>
            Trang thanh toán VNPay đã được mở trong tab mới.
          </div>
          <button
            onClick={() => window.open(vnpayUrl, '_blank')}
            style={{
              background: '#009B8D', color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 20px', fontSize: 13,
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            Mở lại trang thanh toán →
          </button>
        </div>
      )}

      {apiError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#dc2626', borderRadius: 8, padding: '10px 14px',
          fontSize: 13, marginBottom: 12,
        }}>
          ⚠️ {apiError}
        </div>
      )}

      {!vnpayUrl && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              padding: '12px 20px', border: '1.5px solid #e5e7eb',
              background: '#fff', borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: '#555',
            }}
          >
            ← Chọn thêm dịch vụ
          </button>
          <button
            onClick={handleVNPayRedirect}
            disabled={paying}
            style={{
              flex: 1, padding: '14px 24px',
              background: paying ? '#9ca3af' : 'linear-gradient(135deg,#00bfa8,#007869)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 18px rgba(0,155,141,.35)',
            }}
          >
            {paying ? '⏳ Đang lấy link...' : `💳 Thanh toán ${fmt(grandTotal)} qua VNPay`}
          </button>
        </div>
      )}
      <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
        🔒 Bạn sẽ được chuyển đến trang thanh toán an toàn của VNPay Sandbox.
      </p>
    </div>
  );
}

// ── Trang chính ──────────────────────────────────────────────────────────────
export default function BuyTicketPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const { flight, searchData } = location.state || {};

  // screen: 'passenger' → 'addons' → 'payment'
  const [screen,     setScreen]     = useState('passenger');
  const [booking,    setBooking]    = useState(null);
  const [addonTotal, setAddonTotal] = useState(0);

  if (!flight || !searchData) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: 16,
        fontFamily: 'sans-serif', color: '#555',
      }}>
        <div style={{ fontSize: 48 }}>✈️</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Không tìm thấy thông tin chuyến bay</div>
        <div style={{ fontSize: 14, color: '#888' }}>Vui lòng tìm kiếm và chọn chuyến bay trước.</div>
        <button
          onClick={() => navigate('/home')}
          style={{
            marginTop: 8, padding: '10px 24px', background: '#1a3c6e',
            color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
          }}
        >
          ← Về trang tìm kiếm
        </button>
      </div>
    );
  }

  // PassengerForm xong → nhận booking từ createBooking → qua addons
  function handlePassengerDone({ booking: bk }) {
    setBooking(bk);
    setScreen('addons');
  }

  // AddonsService xong → lưu tổng tiền addon → qua payment
  function handleAddonsDone({ total }) {
    setAddonTotal(total || 0);
    setScreen('payment');
  }

  if (screen === 'passenger') {
    return (
      <PassengerForm
        flight={flight}
        searchData={searchData}
        onBack={() => navigate(-1)}
        onDone={handlePassengerDone}
      />
    );
  }

  if (screen === 'addons') {
    // Mỗi ticket trong booking là 1 entry — ticket.id là ticket_id cho updateAddon
    const bookings = (booking?.tickets || []).map(t => ({
      id:      t.id,
      depCode: t.flight_instance?.route?.origin?.code      || searchData.from,
      arrCode: t.flight_instance?.route?.destination?.code || searchData.to,
      date:    searchData.date,
    }));

    // Fallback nếu tickets chưa populate
    if (bookings.length === 0) {
      bookings.push({
        id:      booking?.id,
        depCode: searchData.from,
        arrCode: searchData.to,
        date:    searchData.date,
      });
    }

    return (
      <AddonsService
        bookings={bookings}
        onBack={() => setScreen('passenger')}
        onNext={handleAddonsDone}
      />
    );
  }

  if (screen === 'payment') {
    return (
      <PaymentStep
        booking={booking}
        addonTotal={addonTotal}
        onBack={() => setScreen('addons')}
      />
    );
  }

  return null;
}