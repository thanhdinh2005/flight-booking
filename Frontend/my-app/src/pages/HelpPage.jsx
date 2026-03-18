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
    padding: '40px 5%',
    backgroundColor: '#fff',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
  },
  headerSection: {
    marginBottom: '40px',
  },
  mainTitle: {
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
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '25px',
    maxWidth: '1200px',
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: '180px', 
    boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    border: '1px solid #f0f0f0',
    boxSizing: 'border-box',
  },
  iconWrapper: {
    marginBottom: '20px',
  },
  iconImg: {
    width: '50px',
    height: '50px',
    objectFit: 'contain',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#333',
    lineHeight: '1.4',
    margin: 0,
  },
};

export default HelpPage;
