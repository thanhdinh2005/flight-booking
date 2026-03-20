import React from 'react';

const AdditionalServicesDetail = ({ onBack, styles }) => {
  const subServiceItems = [
    { id: 1, title: "Hướng dẫn đặt suất ăn đặc biệt" },
    { id: 2, title: "Hướng dẫn đặt dịch vụ trẻ em đi một mình" },
    { id: 3, title: "Hướng dẫn mua trà sữa LotusDeli" },
    { id: 4, title: "Hướng dẫn mua bảo hiểm TripCARE" },
    { id: 5, title: "Hướng dẫn mua Sky Sofa" },
    { id: 6, title: "Dịch vụ dành cho hành khách cần xác nhận sức khỏe" },
    { id: 7, title: "Dịch vụ dành cho phụ nữ mang thai" },
    { id: 8, title: "Hướng dẫn đặt dịch vụ thú cưng" },
    { id: 9, title: "Hướng dẫn đặt trước chỗ ngồi" },
  ];

  return (
    <>
      <h2 style={styles.sectionHeading}>Dịch vụ bổ trợ & Dịch vụ đặc biệt</h2>
      <div style={styles.gridContainer}>
        {subServiceItems.map((item) => (
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

export default AdditionalServicesDetail;