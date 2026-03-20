import React from 'react';

const PaymentInvoiceDetail = ({ onBack, styles }) => {
  const subPaymentItems = [
    { id: 1, title: "Thay đổi hoặc hoàn vé mua qua đối tác của Vietnam Airlines" },
    { id: 2, title: "Mua vé máy bay trực tuyến" },
    { id: 3, title: "Thông tin cá nhân chưa chính xác" },
    { id: 4, title: "Không nhận được vé điện tử sau khi thanh toán thành công" },
    { id: 5, title: "Các hình thức thanh toán trực tuyến" },
    { id: 6, title: "Mua gói vé Vietnam Airlines Sky Pass" },
    { id: 7, title: "Xuất hóa đơn VAT điện tử cho cá nhân, tổ chức hoặc công ty" },
    { id: 8, title: "Xuất hóa đơn VAT cho Bảo hiểm TripCARE" },
    { id: 9, title: "Chọn giờ khởi hành chặng tàu DB kết hợp với chuyến bay do Vietnam Airlines khai thác" },
  ];

  return (
    <>
      <h2 style={styles.sectionHeading}>Mua vé, Thanh toán & Xuất hóa đơn</h2>
      <div style={styles.gridContainer}>
        {subPaymentItems.map((item) => (
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

export default PaymentInvoiceDetail;