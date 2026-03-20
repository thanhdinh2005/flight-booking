import React, { useState } from 'react';
// --- IMPORT CÁC TRANG CHI TIẾT ---
import FlightInfoPage from './FlightInfoPage'; 
import PaymentInvoiceDetail from './PaymentInvoiceDetail';
import AdditionalServicesDetail from './AdditionalServicesDetail';
import BaggageServicesDetail from './BaggageServicesDetail';
import CheckInDocumentsDetail from './CheckInDocumentsDetail';

// --- IMPORT ICONS (Đảm bảo đường dẫn này đúng với thư mục của bạn) ---
import Icon1 from '../assets/trogiup-1.png';
import Icon2 from '../assets/trogiup-2.png';
import Icon3 from '../assets/trogiup-3.png';
import Icon4 from '../assets/trogiup-4.png';
import Icon6 from '../assets/trogiup-6.png';

const HelpPage = () => {
  // State quản lý việc hiển thị trang chủ trợ giúp hay trang chi tiết
  const [currentView, setCurrentView] = useState('home');

  // Danh sách các danh mục chính tại trang chủ Trợ giúp
  const helpItems = [
    { id: 1, icon: Icon1, title: "Thông tin lịch bay", view: 'flight' },
    { id: 2, icon: Icon2, title: "Mua vé, Thanh toán & Xuất hóa đơn", view: 'payment' },
    { id: 3, icon: Icon3, title: "Dịch vụ bổ trợ & Dịch vụ đặc biệt", view: 'services' },
    { id: 4, icon: Icon4, title: "Hành lý", view: 'baggage' },
    { id: 6, icon: Icon6, title: "Làm thủ tục & Giấy tờ tùy thân", view: 'checkin' },
  ];

  // Hàm quay lại trang chủ trợ giúp
  const goBack = () => setCurrentView('home');

  // Hàm render nội dung dựa trên view hiện tại
  const renderContent = () => {
    switch (currentView) {
      case 'flight':
        return <FlightInfoPage onBack={goBack} styles={styles} />;
      case 'payment':
        return <PaymentInvoiceDetail onBack={goBack} styles={styles} />;
      case 'services':
        return <AdditionalServicesDetail onBack={goBack} styles={styles} />;
      case 'baggage':
        return <BaggageServicesDetail onBack={goBack} styles={styles} />;
      case 'checkin':
        return <CheckInDocumentsDetail onBack={goBack} styles={styles} />;
      default:
        // Giao diện trang chủ Trung tâm trợ giúp (Lưới 5 ô)
        return (
          <div style={styles.gridContainer}>
            {helpItems.map((item) => (
              <div 
                key={item.id} 
                className="help-card" 
                style={styles.card}
                onClick={() => setCurrentView(item.view)}
              >
                <div style={styles.iconWrapper}>
                  <img src={item.icon} alt={item.title} style={styles.iconImg} />
                </div>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <span style={styles.viewDetail}>
                  Xem chi tiết
                </span>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      {/* CSS Inline để xử lý hiệu ứng hover mà không cần file CSS riêng */}
      <style>
        {`
          .help-card { 
            background-color: #fff !important; 
            transition: all 0.25s ease; 
            border: 1px solid #e0e0e0; 
            cursor: pointer; 
          }
          .help-card:hover { 
            background-color: #f9f9f9 !important; 
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; 
          }
          .help-card:active {
            transform: translateY(0);
          }
        `}
      </style>

      {/* Header chỉ hiển thị ở trang chủ hoặc có thể giữ cố định tùy ý bạn */}
      <div style={styles.headerSection}>
        <h1 style={styles.mainTitle}>Trung tâm trợ giúp</h1>
        <p style={styles.subTitle}>Hãy cùng Vietnam Airlines giải đáp cho những chủ đề thường gặp.</p>
      </div>

      {renderContent()}
    </div>
  );
};

// --- HỆ THỐNG STYLE DÙNG CHUNG CHO TOÀN BỘ CÁC TRANG CON ---
const styles = {
  container: { padding: '40px 5%', boxSizing: 'border-box', minHeight: '100%' },
  headerSection: { marginBottom: '40px' },
  mainTitle: { fontSize: '32px', fontWeight: 'bold', color: '#00305B' },
  subTitle: { fontSize: '16px', color: '#666', marginTop: '10px' },
  sectionHeading: { fontSize: '28px', fontWeight: '700', marginBottom: '30px', color: '#333' },
  gridContainer: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '25px', 
    maxWidth: '1200px' 
  },
  card: { 
    borderRadius: '20px', 
    padding: '30px', 
    display: 'flex', 
    flexDirection: 'column', 
    minHeight: '200px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)' 
  },
  cardDetail: { 
    borderRadius: '15px', 
    padding: '25px', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    minHeight: '150px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
  },
  iconWrapper: { marginBottom: '20px' },
  iconImg: { width: '50px', height: '50px', objectFit: 'contain' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#333', lineHeight: '1.4' },
  cardText: { fontSize: '16px', fontWeight: '500', color: '#333', lineHeight: '1.5', margin: 0 },
  viewDetail: { 
    fontSize: '14px', 
    fontWeight: '600', 
    color: '#005f6e', 
    textDecoration: 'underline', 
    marginTop: 'auto',
    paddingTop: '15px'
  },
  viewMore: { fontSize: '14px', color: '#005f6e', fontWeight: '600', marginTop: '15px' },
  backBtn: { 
    marginTop: '40px', 
    padding: '12px 30px', 
    cursor: 'pointer', 
    borderRadius: '30px', 
    border: '1px solid #005f6e', 
    backgroundColor: '#fff', 
    color: '#005f6e', 
    fontWeight: '600',
    transition: 'all 0.2s ease'
  }
};

export default HelpPage;
