import React, { useState } from 'react';

// --- IMPORT ASSETS ---
import Exp1 from '../assets/experience-1.png';
import Exp2 from '../assets/experience-2.png';
import Exp3 from '../assets/experience-3.png';
import Exp4 from '../assets/experience-4.png';
import Exp5 from '../assets/experience-5.png';
import Exp6 from '../assets/experience-6.png';
import Exp7 from '../assets/experience-7.png';

const ExperiencePage = () => {
  const [idx, setIdx] = useState(0);

  const slides = [
    { 
      img: Exp1, title: "Dịch vụ trên không", 
      desc: "Trải nghiệm không gian máy bay hiện đại, dịch vụ chuyên nghiệp từ hạng Phổ thông tới hạng Thương gia.",
      layout: 'right' 
    },
    { 
      img: Exp2, title: "Hạng Thương gia", 
      desc: "Trải nghiệm dịch vụ và công nghệ tân tiến khi bay hạng Thương Gia cùng Vietnam Airlines.",
      layout: 'center' 
    },
    { 
      img: Exp3, title: "Hạng Phổ thông đặc biệt", 
      desc: "Lý tưởng cho những ai mong muốn có sự linh hoạt và tiện lợi tối đa.",
      layout: 'left' 
    },
    { 
      img: Exp4, title: "Hạng Phổ thông", 
      desc: "Nỗ lực mang lại những tiện ích cho tất cả hành khách để mỗi chuyến đi đều thú vị.",
      layout: 'left' 
    },
    { 
      img: Exp5, title: "Giải trí trên chuyến bay", 
      desc: [
        "Ứng dụng đọc báo và tạp chí PressReader",
        "Chương trình giải trí Lotustar",
        "Chương trình giải trí FPT Play",
        "Ấn phẩm Heritage",
        "Giải trí không dây trên tàu bay A321"
      ],
      layout: 'left' 
    },
    { 
      img: Exp6, title: "Kết nối Internet trên chuyến bay", 
      desc: "Hành khách có thể trải nghiệm dịch vụ Internet (In-Flight Connectivity) trên các chuyến bay bằng tàu Airbus A350, mang đến khả năng kết nối liên tục xuyên suốt hành trình.",
      layout: 'bottom-left' 
    },
    { 
      img: Exp7, 
      title: "Mua sắm miễn thuế đẳng cấp 4 sao ngay trên chuyến bay", 
      desc: "Tận hưởng ưu đãi giảm giá lên đến 5% cho tất cả các sản phẩm. ",
      hasLink: true, 
      layout: 'right' 
    },
  ];

  const goNext = () => setIdx((idx + 1) % slides.length);
  const goPrev = () => setIdx((idx - 1 + slides.length) % slides.length);

  // SỬA TẠI ĐÂY: Dùng % thay vì px cố định để Responsive theo Sidebar
  const getLayoutStyle = (layout) => {
    switch (layout) {
      case 'center':
        return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '80%' };
      case 'left':
        return { left: '10%', top: '50%', transform: 'translateY(-50%)', textAlign: 'left', width: '40%' };
      case 'bottom-left':
        return { left: '8%', bottom: '80px', textAlign: 'left', width: '80%' };
      default: // right
        return { right: '8%', top: '50%', transform: 'translateY(-50%)', textAlign: 'right', width: '40%' };
    }
  };

  return (
    <div style={styles.wrapper}>
      <img src={slides[idx].img} style={styles.bgImage} alt="Experience" />

      <button onClick={goPrev} style={styles.navL}>❮</button>
      <button onClick={goNext} style={styles.navR}>❯</button>

      <div key={idx} style={{ ...styles.contentBase, ...getLayoutStyle(slides[idx].layout) }}>
        <h1 style={styles.title}>{slides[idx].title}</h1>
        
        {Array.isArray(slides[idx].desc) ? (
          <ul style={styles.list}>
            {slides[idx].desc.map((item, i) => <li key={i} style={styles.listItem}>{item}</li>)}
          </ul>
        ) : (
          <p style={styles.description}>
            {slides[idx].desc}
            {slides[idx].hasLink && (
              <span style={styles.linkText}>Chi tiết.</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: { position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000' },
  bgImage: { width: '100%', height: '100%', objectFit: 'cover' },
  navL: { position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '50px', height: '50px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.3)', color: '#fff', cursor: 'pointer', fontSize: '24px', backdropFilter: 'blur(5px)' },
  navR: { position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '50px', height: '50px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.3)', color: '#fff', cursor: 'pointer', fontSize: '24px', backdropFilter: 'blur(5px)' },
  contentBase: { position: 'absolute', color: '#fff', textShadow: '2px 2px 25px rgba(0,0,0,0.8)', zIndex: 5 },
  // Dùng clamp để font tự co giãn khi vùng chứa bị Sidebar ép lại
  title: { fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' },
  description: { fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: '1.6', opacity: 0.95 },
  list: { paddingLeft: '20px', margin: 0 },
  listItem: { fontSize: 'clamp(14px, 1.8vw, 20px)', lineHeight: '1.8', listStyleType: 'disc', marginBottom: '8px' },
  linkText: {
    color: '#40E0D0',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginLeft: '5px',
    fontWeight: 'bold'
  }
};

export default ExperiencePage;
