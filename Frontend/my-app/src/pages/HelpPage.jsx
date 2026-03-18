import React from 'react';

// --- IMPORT 6 ICONS ---
import Icon1 from '../assets/trogiup-1.png';
import Icon2 from '../assets/trogiup-2.png';
import Icon3 from '../assets/trogiup-3.png';
import Icon4 from '../assets/trogiup-4.png';
import Icon5 from '../assets/trogiup-5.png';
import Icon6 from '../assets/trogiup-6.png';

const HelpPage = () => {
  const helpItems = [
    { id: 1, icon: Icon1, title: "Thông tin lịch bay" },
    { id: 2, icon: Icon2, title: "Mua vé, Thanh toán & Xuất hóa đơn" },
    { id: 3, icon: Icon3, title: "Dịch vụ bổ trợ & Dịch vụ đặc biệt" },
    { id: 4, icon: Icon4, title: "Hành lý" },
    { id: 5, icon: Icon5, title: "Tiêu chuẩn hành lý xách tay mới" },
    { id: 6, icon: Icon6, title: "Làm thủ tục & Giấy tờ tùy thân" },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h1 style={styles.mainTitle}>Trung tâm trợ giúp</h1>
        <p style={styles.subTitle}>
          Hãy cùng Vietnam Airlines giải đáp cho những chủ đề thường gặp.
        </p>
      </div>

      <div style={styles.gridContainer}>
        {helpItems.map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={styles.iconWrapper}>
              <img src={item.icon} alt={item.title} style={styles.iconImg} />
            </div>
            <h3 style={styles.cardTitle}>{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- HỆ THỐNG STYLES ---
const styles = {
  container: {
    // Sửa padding dùng % để không bị Sidebar đè khi màn hình nhỏ
    padding: '5% 6%',
    backgroundColor: '#fff',
    minHeight: '100%',
    overflowX: 'hidden',
  },
  headerSection: {
    marginBottom: '40px',
  },
  mainTitle: {
    // Chữ tự to nhỏ theo màn hình
    fontSize: 'clamp(24px, 3vw, 32px)',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: '15px',
  },
  subTitle: {
    fontSize: 'clamp(14px, 1.5vw, 18px)',
    color: '#333',
    opacity: 0.8,
  },
  gridContainer: {
    display: 'grid',
    // Tự động nhảy số cột: Nếu hẹp thì 1 cột, rộng thì tối đa 3 cột
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '25px',
    maxWidth: '1200px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '25px',
    padding: '25px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: '160px', // Dùng minHeight thay vì height cố định
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid #f0f0f0',
  },
  iconWrapper: {
    marginBottom: '15px',
  },
  iconImg: {
    width: 'clamp(40px, 4vw, 50px)',
    height: 'clamp(40px, 4vw, 50px)',
    objectFit: 'contain',
  },
  cardTitle: {
    fontSize: 'clamp(15px, 1.2vw, 17px)',
    fontWeight: '600',
    color: '#333',
    lineHeight: '1.4',
    margin: 0,
  },
};

export default HelpPage;