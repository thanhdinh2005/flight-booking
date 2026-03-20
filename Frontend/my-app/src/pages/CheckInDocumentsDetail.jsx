import React from 'react';

const CheckInDocumentsDetail = ({ onBack, styles }) => {
  const subCheckInItems = [
    { id: 1, title: "Giấy tờ làm thủ tục cho phụ nữ mang thai" },
    { id: 2, title: "Giấy tờ làm thủ tục cho trẻ em đi một mình" },
    { id: 3, title: "Hướng dẫn làm thủ tục trực tuyến" },
    { id: 4, title: "Gỡ check-in online" },
    { id: 5, title: "Làm thủ tục cho động vật cảnh" },
    { id: 6, title: "Làm thủ tục trực tuyến không thành công" },
    { id: 7, title: "Thời gian đóng quầy làm thủ tục tại sân bay" },
    { id: 8, title: "Làm thủ tục cho trẻ em đi một mình" },
    { id: 9, title: "Làm thủ tục tại kiosk" },
    { id: 10, title: "Yêu cầu về giấy tờ cho người đi cùng trẻ em" },
    { id: 11, title: "Giấy tờ tùy thân cần chuẩn bị trước chuyến bay" },
  ];

  return (
    <>
      <h2 style={styles.sectionHeading}>Làm thủ tục & Giấy tờ tùy thân</h2>
      <div style={styles.gridContainer}>
        {subCheckInItems.map((item) => (
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

export default CheckInDocumentsDetail;