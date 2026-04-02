import React, { useState } from 'react';
import BannerImg from '../assets/tet-banner.png';
import DestinationImg from '../assets/destination.jpg';

// ── Helper functions for input validation ──────────────────
function removeAccents(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function lettersOnly(value) {
  const noAccents = removeAccents(value)
  return noAccents.replace(/[^a-zA-Z\s-]/g, '').toUpperCase()
}

const DiscoveryPage = () => {
  const [bookingCode, setBookingCode] = useState('')
  const [passengerName, setPassengerName] = useState('')

  return (
    <div style={styles.container}>
      {/* PHẦN BANNER VÀ FORM TÌM KIẾM */}
      <div style={styles.heroSection}>
        <img src={BannerImg} alt="Tet Banner" style={styles.bannerImage} />
        
        <div style={styles.searchForm}>
          <h3 style={styles.formTitle}>Mua vé và quản lý đặt chỗ</h3>
          <div style={styles.inputRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mã đặt chỗ</label>
              <input 
                type="text" 
                placeholder="Nhập mã..." 
                value={bookingCode}
                onChange={e => setBookingCode(e.target.value.toUpperCase())}
                style={styles.input} 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Họ và tên hành khách</label>
              <input 
                type="text" 
                placeholder="Nguyễn Văn A..." 
                value={passengerName}
                onChange={e => setPassengerName(lettersOnly(e.target.value))}
                onKeyDown={e => {
                  const allowKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' ']
                  if (e.ctrlKey || e.metaKey || allowKeys.includes(e.key)) return
                  if (!/^[a-zA-Z-\s]$/.test(e.key) && e.key.length === 1) e.preventDefault()
                }}
                style={styles.input} 
              />
            </div>
            <button style={styles.searchBtn}>Tìm kiếm</button>
          </div>
        </div>
      </div>

      {/* PHẦN DANH SÁCH ĐIỂM ĐẾN YÊU THÍCH */}
      <div style={styles.destinationSection}>
        <h2 style={styles.sectionTitle}>Các chuyến bay được yêu thích nhất</h2>
        <div style={styles.cardGrid}>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} style={styles.card}>
              <img src={DestinationImg} alt="Destination" style={styles.cardImg} />
              <div style={styles.cardOverlay}>
                <div style={styles.cardText}>
                  <p style={styles.route}>TP. Hồ Chí Minh (SGN)</p>
                  <p style={styles.arrow}>↓</p>
                  <p style={styles.route}>Đà Nẵng (DAD)</p>
                </div>
                <button style={styles.buyBtnSmall}>Mua ngay</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- HỆ THỐNG STYLES CHO TRANG KHÁM PHÁ ---
const styles = {
  container: { paddingBottom: '100px', backgroundColor: '#fff' },
  heroSection: { position: 'relative', width: '100%', height: '450px' },
  bannerImage: { width: '100%', height: '100%', objectFit: 'cover' },
  
  searchForm: { 
    position: 'absolute', 
    bottom: '-40px', 
    left: '50%', 
    transform: 'translateX(-50%)', 
    width: '85%', 
    backgroundColor: '#FFF', 
    padding: '30px', 
    borderRadius: '15px', 
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)', 
    zIndex: 5 
  },
  formTitle: { marginBottom: '20px', fontSize: '20px', color: '#00305B', fontWeight: 'bold' },
  inputRow: { display: 'flex', gap: '20px', alignItems: 'flex-end' },
  inputGroup: { flex: 1, borderBottom: '1px solid #CCC' },
  label: { fontSize: '12px', color: '#888', display: 'block', marginBottom: '5px' },
  input: { border: 'none', width: '100%', padding: '10px 0', outline: 'none', fontSize: '16px' },
  searchBtn: { 
    backgroundColor: '#006680', 
    color: '#FFF', 
    border: 'none', 
    padding: '12px 35px', 
    borderRadius: '25px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: 'background 0.3s'
  },

  destinationSection: { marginTop: '100px', padding: '0 50px' },
  sectionTitle: { fontSize: '24px', marginBottom: '30px', color: '#333' },
  cardGrid: { display: 'flex', gap: '25px' },
  card: { flex: 1, height: '300px', borderRadius: '20px', overflow: 'hidden', position: 'relative', cursor: 'pointer' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' },
  cardOverlay: { 
    position: 'absolute', 
    inset: 0, 
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'flex-end', 
    padding: '20px', 
    color: '#fff' 
  },
  cardText: { marginBottom: '10px' },
  route: { fontSize: '14px', margin: 0, fontWeight: '500' },
  arrow: { margin: '2px 0', fontSize: '12px', opacity: 0.7 },
  buyBtnSmall: { 
    backgroundColor: '#40E0D0', 
    color: '#00305B',
    border: 'none', 
    padding: '10px', 
    borderRadius: '8px', 
    fontWeight: 'bold', 
    cursor: 'pointer'
  }
};

export default DiscoveryPage;