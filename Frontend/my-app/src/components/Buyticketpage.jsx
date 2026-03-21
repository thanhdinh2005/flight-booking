// src/pages/BuyTicketPage.jsx
// Trang mua vé — nhận dữ liệu chuyến bay qua React Router location.state
import { useLocation, useNavigate } from 'react-router-dom';
import PassengerForm from '../components/Passengerform';

export default function BuyTicketPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const { flight, searchData } = location.state || {};

  // Nếu không có dữ liệu (ví dụ user truy cập trực tiếp URL) → về trang tìm kiếm
  if (!flight || !searchData) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: 16,
        fontFamily: 'sans-serif', color: '#555'
      }}>
        <div style={{ fontSize: 48 }}>✈️</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Không tìm thấy thông tin chuyến bay</div>
        <div style={{ fontSize: 14, color: '#888' }}>Vui lòng tìm kiếm và chọn chuyến bay trước.</div>
        <button
          onClick={() => navigate('/home')}
          style={{
            marginTop: 8, padding: '10px 24px', background: '#1a3c6e',
            color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14
          }}
        >
          ← Về trang tìm kiếm
        </button>
      </div>
    );
  }

  function handleDone() {
    // Sau khi đặt vé xong → về home hoặc trang vé của tôi
    navigate('/my-tickets', { replace: true });
  }

  function handleBack() {
    // Quay lại trang kết quả tìm kiếm với đúng params
    navigate(-1);
  }

  return (
    <PassengerForm
      flight={flight}
      searchData={searchData}
      onBack={handleBack}
      onDone={handleDone}
    />
  );
}