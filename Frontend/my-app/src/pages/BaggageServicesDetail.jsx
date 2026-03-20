import React from 'react';

const BaggageServicesDetail = ({ onBack, styles }) => {
  const subBaggageItems = [
    { id: 1, title: "Khiếu nại hành lý bị thất lạc hoặc hư hỏng" },
    { id: 2, title: "Ký gửi hành lý quá khổ, cồng kềnh như nhạc cụ, khung ảnh cỡ lớn, v.v." },
    { id: 3, title: "Quy định về trọng lượng và kích thước của một kiện hành lý ký gửi" },
    { id: 4, title: "Tiêu chuẩn hành lý xách tay miễn cước" },
    { id: 5, title: "Hướng dẫn mua thêm hành lý ký gửi tại sân bay" },
    { id: 6, title: "Hướng dẫn mua thêm hành lý ký gửi qua website/app" },
    { id: 7, title: "Hướng dẫn đặt dịch vụ vận chuyển dụng cụ thể thao" },
    { id: 8, title: "Hỗ trợ hành lý nối chuyến" },
  ];

  return (
    <>
      <h2 style={styles.sectionHeading}>Hành lý</h2>
      <div style={styles.gridContainer}>
        {subBaggageItems.map((item) => (
          <div key={item.id} className="help-card" style={styles.cardDetail}>
            <p style={styles.cardText}>{item.title}</p>
            <span style={styles.viewMore}>Xem thêm →</span>
          </div>
        ))}
      </div>
      <button onClick={onBack} style={styles.backBtn}>
        ← Quay lại
      </button>
    </>
  );
};

export default BaggageServicesDetail;