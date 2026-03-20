import React from 'react';

const FlightInfoPage = ({ onBack, styles }) => {
  // Dữ liệu 4 mục lấy chính xác từ ảnh "Thông tin lịch bay"
  const subFlightItems = [
    { id: 1, title: "Tra cứu thông tin lịch bay của Vietnam Airlines" },
    { id: 2, title: "Chọn chuyến bay khác phù hợp hơn khi Vietnam Airlines điều chỉnh giờ bay" },
    { id: 3, title: "Xem lịch sử chuyến bay đã thực hiện" },
    { id: 4, title: "Lỡ nối chuyến khi chuyến bay bị hủy, đổi hành trình, đổi giờ bay" },
  ];

  return (
    <>
      {/* Tiêu đề trang con */}
      <h2 style={styles.sectionHeading}>Thông tin lịch bay</h2>
      
      {/* Lưới hiển thị 3 cột giúp hiện đủ các mục */}
      <div style={styles.gridContainer}>
        {subFlightItems.map((item) => (
          <div key={item.id} className="help-card" style={styles.cardDetail}>
            <p style={styles.cardText}>{item.title}</p>
            <span style={styles.viewMore}>Xem thêm →</span>
          </div>
        ))}
      </div>

      {/* Nút quay lại để về trang chủ HelpPage */}
      <button onClick={onBack} style={styles.backBtn}>
        ← Quay lại
      </button>
    </>
  );
};

export default FlightInfoPage;