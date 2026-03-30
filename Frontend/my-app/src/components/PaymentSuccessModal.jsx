import { useNavigate } from 'react-router-dom';

export default function PaymentSuccessModal({ isOpen, onViewTickets, onGoBack }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewTickets = () => {
    if (onViewTickets) onViewTickets();
    navigate('/my-tickets');
  };

  const handleGoBack = () => {
    if (onGoBack) onGoBack();
    window.location.reload();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '40px 32px',
        maxWidth: 480,
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.4s ease-out',
      }}>
        {/* Success Icon */}
        <div style={{
          width: 80,
          height: 80,
          margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #00d4aa, #00a885)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          boxShadow: '0 10px 30px rgba(0, 212, 170, 0.3)',
        }}>
          ✓
        </div>

        {/* Title */}
        <h2 style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 800,
          color: '#065f46',
          marginBottom: 8,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}>
          Thanh toán thành công!
        </h2>

        {/* Description */}
        <p style={{
          margin: '8px 0 28px',
          fontSize: 14,
          color: '#6b7280',
          lineHeight: 1.6,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}>
          Đơn hàng của bạn đã được xác nhận. Vé máy bay sẽ được gửi qua email trong vài phút tới.
        </p>

        {/* Confirmation Box */}
        <div style={{
          background: '#f0fdf9',
          border: '2px solid #a7f3d0',
          borderRadius: 12,
          padding: '16px',
          marginBottom: 28,
          color: '#065f46',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}>
          📬 Vui lòng kiểm tra email để lấy vé và mã booking của bạn
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 12,
          flexDirection: 'column',
        }}>
          <button
            onClick={handleViewTickets}
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #00d4aa, #00a885)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(0, 212, 170, 0.3)',
              fontFamily: "'Be Vietnam Pro', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 212, 170, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 212, 170, 0.3)';
            }}
          >
            🎫 Xem vé của tôi
          </button>
          <button
            onClick={handleGoBack}
            style={{
              padding: '14px 24px',
              background: '#f3f4f6',
              color: '#374151',
              border: '2px solid #d1d5db',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Be Vietnam Pro', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e5e7eb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            ← Trở về trang tìm kiếm
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
