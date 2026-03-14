// RefundPolicyModal.jsx — Modal chính sách hoàn vé
// Aesthetic: Việt Jett — teal & white clean glass
import { useState, useEffect } from "react";

const css = `
  .rpm-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(26,42,42,0.55);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .rpm-box {
    background: #fff;
    border-radius: 16px;
    width: 100%; max-width: 560px;
    max-height: 90vh;
    display: flex; flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(42,171,171,0.18);
    border: 1.5px solid rgba(42,171,171,0.2);
  }
  .rpm-topbar {
    height: 3px;
    background: linear-gradient(90deg, #2aabab, #4ecfcf, #2aabab);
    background-size: 200% 100%;
    animation: rpm-shimmer 2.5s linear infinite;
  }
  @keyframes rpm-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .rpm-header {
    padding: 24px 28px 16px;
    display: flex; align-items: flex-start; justify-content: space-between;
    border-bottom: 1px solid rgba(42,171,171,0.12);
  }
  .rpm-header__eyebrow {
    font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #2aabab; margin-bottom: 4px;
  }
  .rpm-header__title {
    font-size: 22px; font-weight: 700;
    color: #1a2a2a; line-height: 1.2;
  }
  .rpm-header__title em {
    font-style: normal;
    color: #2aabab;
  }
  .rpm-close {
    background: none; border: none;
    font-size: 16px; color: #5a7a7a;
    cursor: pointer; padding: 4px 6px;
    border-radius: 6px;
    transition: background .15s, color .15s;
    margin-top: 2px;
  }
  .rpm-close:hover { background: rgba(42,171,171,0.1); color: #2aabab; }

  .rpm-body {
    flex: 1; overflow-y: auto;
    padding: 20px 28px;
    scroll-behavior: smooth;
  }
  .rpm-body::-webkit-scrollbar { width: 4px; }
  .rpm-body::-webkit-scrollbar-track { background: #f0fafa; }
  .rpm-body::-webkit-scrollbar-thumb { background: rgba(42,171,171,0.4); border-radius: 4px; }

  .rpm-section { margin-bottom: 22px; }
  .rpm-section__number {
    font-size: 9px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #2aabab; margin-bottom: 4px;
  }
  .rpm-section__title {
    font-size: 14px; font-weight: 700;
    color: #1a2a2a; margin-bottom: 10px;
    padding-left: 10px;
    border-left: 3px solid #2aabab;
  }
  .rpm-rule {
    display: flex; gap: 10px;
    font-size: 13px; color: #3a5a5a;
    margin-bottom: 7px; line-height: 1.5;
    padding-left: 10px;
  }
  .rpm-rule__dash {
    color: #2aabab; font-weight: 700;
    flex-shrink: 0;
  }

  .rpm-progress-wrap {
    padding: 12px 28px;
    border-top: 1px solid rgba(42,171,171,0.12);
  }
  .rpm-progress-label {
    display: flex; justify-content: space-between;
    font-size: 11px; color: #5a7a7a;
    margin-bottom: 6px;
  }
  .rpm-progress-track {
    height: 4px; background: rgba(42,171,171,0.15);
    border-radius: 4px; overflow: hidden;
  }
  .rpm-progress-fill {
    height: 100%; background: #2aabab;
    border-radius: 4px;
    transition: width .3s ease;
  }

  .rpm-footer {
    padding: 16px 28px 20px;
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid rgba(42,171,171,0.12);
    flex-wrap: wrap;
  }
  .rpm-must-scroll {
    font-size: 11px; color: #5a7a7a;
    font-style: italic; margin-right: auto;
  }
  .rpm-btn-ghost {
    font-size: 13px; font-weight: 600;
    padding: 9px 20px;
    border: 1.5px solid rgba(42,171,171,0.3);
    background: transparent; color: #5a7a7a;
    cursor: pointer; border-radius: 8px;
    transition: all .15s;
  }
  .rpm-btn-ghost:hover { border-color: #2aabab; color: #2aabab; }
  .rpm-btn-agree {
    font-size: 13px; font-weight: 700;
    padding: 9px 22px;
    background: #2aabab; color: #fff;
    border: none; cursor: pointer;
    border-radius: 8px;
    transition: background .15s, opacity .15s, transform .1s;
  }
  .rpm-btn-agree:hover:not(:disabled) { background: #1e8888; }
  .rpm-btn-agree:active:not(:disabled) { transform: scale(.97); }
  .rpm-btn-agree:disabled { opacity: .45; cursor: not-allowed; }
`

const SECTIONS = [
  {
    title: "Hoàn vé trước 24 giờ khởi hành",
    rules: [
      { text: <><strong>Vé hạng Phổ thông:</strong> hoàn lại 70% giá vé gốc</> },
      { text: <><strong>Vé hạng Thương gia:</strong> hoàn lại 85% giá vé gốc</> },
      { text: "Yêu cầu hoàn vé phải được thực hiện qua ứng dụng hoặc tổng đài." },
    ],
  },
  {
    title: "Hoàn vé trong 2 – 24 giờ trước khởi hành",
    rules: [
      { text: <><strong>Phí hủy áp dụng:</strong> 30% giá vé cho mọi hạng vé</> },
      { text: "Thời gian hoàn tiền từ 7–10 ngày làm việc kể từ ngày xác nhận." },
    ],
  },
  {
    title: "Hoàn vé dưới 2 giờ hoặc sau khởi hành",
    rules: [
      { text: <><strong>Không hoàn tiền</strong> trong mọi trường hợp</> },
      { text: "Vé không sử dụng sẽ mất hiệu lực hoàn toàn." },
    ],
  },
  {
    title: "Hãng hủy chuyến bay",
    rules: [
      { text: <><strong>Hoàn 100%</strong> giá vé trong vòng 7–14 ngày làm việc</> },
      { text: "Hoặc được đổi sang chuyến bay khác mà không mất phí." },
    ],
  },
  {
    title: "Các khoản không được hoàn",
    rules: [
      { text: "Phí hành lý ký gửi đã thanh toán" },
      { text: "Phí chọn chỗ ngồi ưu tiên" },
      { text: "Phí bảo hiểm du lịch bổ sung" },
    ],
  },
];

export default function RefundPolicyModal({ onClose = () => {}, onAgree = () => {} }) {
  const [scrollPct, setScrollPct] = useState(0);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  function handleScroll(e) {
    const el = e.target;
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setScrollPct(Math.min(1, pct));
    if (pct >= 0.95) setHasScrolledToEnd(true);
  }

  useEffect(() => {
    const t = setTimeout(() => setHasScrolledToEnd(true), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className="rpm-overlay" onClick={onClose}>
        <div className="rpm-box" onClick={e => e.stopPropagation()}>
          <div className="rpm-topbar" />

          <div className="rpm-header">
            <div>
              <div className="rpm-header__eyebrow">Điều khoản & Điều kiện</div>
              <div className="rpm-header__title">Chính sách <em>hoàn vé</em></div>
            </div>
            <button className="rpm-close" onClick={onClose}>✕</button>
          </div>

          <div className="rpm-body" onScroll={handleScroll}>
            {SECTIONS.map((s, i) => (
              <div key={i} className="rpm-section">
                <div className="rpm-section__number">Điều {i + 1}</div>
                <div className="rpm-section__title">{s.title}</div>
                {s.rules.map((r, j) => (
                  <div key={j} className="rpm-rule">
                    <span className="rpm-rule__dash">—</span>
                    <span>{r.text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="rpm-progress-wrap">
            <div className="rpm-progress-label">
              <span>Tiến độ đọc</span>
              <span>{Math.round(scrollPct * 100)}%</span>
            </div>
            <div className="rpm-progress-track">
              <div className="rpm-progress-fill" style={{ width: `${scrollPct * 100}%` }} />
            </div>
          </div>

          <div className="rpm-footer">
            {!hasScrolledToEnd && (
              <span className="rpm-must-scroll">↓ Vui lòng đọc hết nội dung</span>
            )}
            <button className="rpm-btn-ghost" onClick={onClose}>Đóng</button>
            <button
              className="rpm-btn-agree"
              disabled={!hasScrolledToEnd}
              onClick={() => { onAgree(); onClose(); }}
            >
              Đã đọc & Đồng ý
            </button>
          </div>
        </div>
      </div>
    </>
  );
}