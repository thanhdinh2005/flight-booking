// src/components/checkin/AddonsService.jsx
// Aesthetic: Việt Jett — teal & white, clean and airy
import { useState } from 'react'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .as-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f0fafa;
    min-height: 100vh;
    padding: 32px 20px 56px;
    --bg: #f0fafa;
    --card: #fff;
    --teal: #2aabab;
    --teal-dim: rgba(42,171,171,0.10);
    --teal-mid: rgba(42,171,171,0.25);
    --teal-dark: #1e8888;
    --sage: #3a9e7e;
    --sage-dim: rgba(58,158,126,0.12);
    --ink: #1a2a2a;
    --muted: #5a7a7a;
    --border: #c8e8e8;
    --gold: #2aabab;
  }

  .as-container { max-width: 820px; margin: 0 auto; }

  /* Header */
  .as-header { margin-bottom: 32px; }
  .as-header__tag {
    display: inline-block;
    background: var(--teal-dim);
    color: var(--teal);
    font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 4px 10px; border-radius: 2px;
    margin-bottom: 10px;
  }
  .as-header__title {
    font-family: 'Fraunces', serif;
    font-size: 30px; font-weight: 700;
    color: var(--ink); letter-spacing: -.3px; line-height: 1.1;
  }
  .as-header__sub {
    font-size: 13px; color: var(--muted); margin-top: 6px;
  }

  /* Per-flight tabs */
  .as-flights {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .as-ftab {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    padding: 7px 16px;
    border: 1.5px solid var(--border);
    background: var(--card);
    color: var(--muted);
    cursor: pointer;
    border-radius: 100px;
    transition: all .15s;
  }
  .as-ftab.active {
    border-color: var(--teal);
    background: var(--teal-dim);
    color: var(--teal);
  }

  /* Section */
  .as-section { margin-bottom: 32px; }
  .as-section__header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 14px;
  }
  .as-section__icon {
    width: 36px; height: 36px;
    background: var(--teal-dim);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .as-section__title {
    font-family: 'Fraunces', serif;
    font-size: 18px; font-weight: 700;
    color: var(--ink); line-height: 1;
  }
  .as-section__sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

  /* Service cards grid */
  .as-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 10px;
  }
  .as-card {
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 14px;
    cursor: pointer;
    transition: all .18s;
    position: relative;
    overflow: hidden;
  }
  .as-card:hover {
    border-color: var(--teal-mid);
    box-shadow: 0 4px 18px rgba(42,171,171,0.12);
    transform: translateY(-2px);
  }
  .as-card.selected {
    border-color: var(--teal);
    background: #f0fbfb;
    box-shadow: 0 4px 18px rgba(42,171,171,0.18);
  }
  .as-card.selected::before {
    content: '✓';
    position: absolute; top: 9px; right: 9px;
    width: 18px; height: 18px;
    background: var(--teal);
    color: #fff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700;
    line-height: 18px; text-align: center;
  }
  .as-card__emoji { font-size: 24px; margin-bottom: 8px; display: block; }
  .as-card__name {
    font-size: 13px; font-weight: 600; color: var(--ink);
    margin-bottom: 2px; line-height: 1.3;
  }
  .as-card__desc {
    font-size: 11px; color: var(--muted);
    margin-bottom: 8px; line-height: 1.4;
  }
  .as-card__price {
    font-family: 'Fraunces', serif;
    font-size: 15px; font-weight: 700;
    color: var(--teal);
  }
  .as-card__price--free { color: var(--sage); }

  /* Meal selector */
  .as-meal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
  .as-meal-card {
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all .18s;
  }
  .as-meal-card:hover {
    border-color: var(--teal-mid);
    transform: translateY(-2px);
    box-shadow: 0 4px 18px rgba(42,171,171,.12);
  }
  .as-meal-card.selected {
    border-color: var(--teal);
  }
  .as-meal-card__img {
    height: 80px;
    display: flex; align-items: center; justify-content: center;
    font-size: 44px;
    background: var(--teal-dim);
  }
  .as-meal-card.selected .as-meal-card__img { background: rgba(42,171,171,0.18); }
  .as-meal-card__body { padding: 10px 12px; }
  .as-meal-card__name {
    font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px;
  }
  .as-meal-card__type {
    font-size: 10px; color: var(--muted); text-transform: uppercase;
    letter-spacing: .5px; margin-bottom: 6px;
  }
  .as-meal-card__price {
    font-family: 'Fraunces', serif;
    font-size: 14px; font-weight: 700; color: var(--teal);
  }
  .as-meal-selected-badge {
    display: inline-block;
    background: var(--teal);
    color: #fff;
    font-size: 9px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    padding: 2px 7px; border-radius: 100px;
    margin-left: 6px;
  }

  /* Order summary */
  .as-summary {
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    padding: 20px 24px;
    margin-top: 28px;
    margin-bottom: 20px;
  }
  .as-summary__title {
    font-family: 'Fraunces', serif;
    font-size: 16px; font-weight: 700; color: var(--ink);
    margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .as-sum-row {
    display: flex; justify-content: space-between;
    font-size: 13px; color: var(--muted);
    padding: 7px 0;
    border-bottom: 1px dashed var(--border);
  }
  .as-sum-row:last-of-type { border-bottom: none; }
  .as-sum-row b { color: var(--ink); font-weight: 600; }
  .as-sum-total {
    display: flex; justify-content: space-between;
    font-family: 'Fraunces', serif;
    font-size: 20px; font-weight: 700;
    color: var(--ink);
    padding-top: 14px;
    border-top: 1.5px solid var(--border);
    margin-top: 4px;
  }
  .as-sum-total span:first-child {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .5px;
    color: var(--muted); align-self: center;
  }

  /* Bottom bar */
  .as-bar {
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px;
  }
  .as-back-btn {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    padding: 10px 20px;
    border: 1.5px solid var(--border);
    background: transparent;
    color: var(--muted);
    cursor: pointer; border-radius: 10px;
    transition: all .15s;
  }
  .as-back-btn:hover { border-color: var(--teal); color: var(--teal); }
  .as-checkin-btn {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 700;
    padding: 12px 28px;
    background: var(--teal);
    color: #fff;
    border: none;
    letter-spacing: .3px;
    cursor: pointer; border-radius: 10px;
    transition: background .15s, transform .1s;
  }
  .as-checkin-btn:hover { background: var(--teal-dark); }
  .as-checkin-btn:active { transform: scale(.98); }
  .as-skip-note {
    font-size: 11px; color: var(--muted);
    text-align: right; margin-bottom: 8px;
    font-style: italic;
  }

  @media (max-width: 540px) {
    .as-cards { grid-template-columns: 1fr 1fr; }
    .as-meal-grid { grid-template-columns: 1fr 1fr; }
  }
`

const BAGGAGE_OPTIONS = [
  { id: 'bag_20', emoji: '🧳', name: 'Hành lý 20 kg', desc: 'Ký gửi thêm 20kg', price: 250000 },
  { id: 'bag_30', emoji: '🧳', name: 'Hành lý 30 kg', desc: 'Ký gửi thêm 30kg', price: 380000 },
  { id: 'bag_sport', emoji: '🎿', name: 'Thiết bị thể thao', desc: 'Gậy golf, ván trượt...', price: 450000 },
  { id: 'bag_carry', emoji: '👜', name: 'Xách tay thêm', desc: '+1 kiện xách tay 7kg', price: 120000 },
]

const MEAL_OPTIONS = [
  { id: 'meal_vn', emoji: '🍜', name: 'Phở bò', type: 'Ẩm thực Việt', price: 120000 },
  { id: 'meal_rice', emoji: '🍱', name: 'Cơm gà xào', type: 'Ẩm thực Việt', price: 110000 },
  { id: 'meal_veg', emoji: '🥗', name: 'Set chay', type: 'Chay', price: 95000 },
  { id: 'meal_pasta', emoji: '🍝', name: 'Pasta bò sốt', type: 'Tây', price: 130000 },
  { id: 'meal_sand', emoji: '🥪', name: 'Sandwich + Nước', type: 'Nhẹ', price: 75000 },
  { id: 'meal_kids', emoji: '🍔', name: 'Set trẻ em', type: 'Kids menu', price: 85000 },
]

const PRIORITY_OPTIONS = [
  { id: 'pri_board', emoji: '🚀', name: 'Lên tàu ưu tiên', desc: 'Boarding nhóm 1', price: 80000 },
  { id: 'pri_lounge', emoji: '🛋️', name: 'Phòng chờ VIP', desc: 'Lounge airport', price: 350000 },
  { id: 'pri_fast', emoji: '⚡', name: 'Fast track', desc: 'Cửa an ninh nhanh', price: 150000 },
  { id: 'pri_ins', emoji: '🛡️', name: 'Bảo hiểm chuyến', desc: 'Bảo hiểm 50tr', price: 60000 },
]

function fmt(n) { return n.toLocaleString('vi-VN') + '₫' }

export default function AddonsService({ bookings, onNext, onBack }) {
  const [flightIdx, setFlightIdx] = useState(0)

  const [addons, setAddons] = useState(() => {
    const init = {}
    bookings.forEach(b => {
      init[b.id] = { baggage: new Set(), meals: new Set(), priority: new Set() }
    })
    return init
  })

  const flight = bookings[flightIdx]
  const fa = addons[flight.id]

  function toggle(category, id) {
    setAddons(prev => {
      const s = new Set(prev[flight.id][category])
      s.has(id) ? s.delete(id) : s.add(id)
      return { ...prev, [flight.id]: { ...prev[flight.id], [category]: s } }
    })
  }

  function calcTotal() {
    let total = 0
    bookings.forEach(b => {
      const a = addons[b.id]
      BAGGAGE_OPTIONS.forEach(o => { if (a.baggage.has(o.id)) total += o.price })
      MEAL_OPTIONS.forEach(o => { if (a.meals.has(o.id)) total += o.price })
      PRIORITY_OPTIONS.forEach(o => { if (a.priority.has(o.id)) total += o.price })
    })
    return total
  }

  const total = calcTotal()
  const hasAny = total > 0

  const summaryRows = []
  bookings.forEach(b => {
    const a = addons[b.id]
    const label = `${b.depCode}→${b.arrCode}`
    BAGGAGE_OPTIONS.forEach(o => { if (a.baggage.has(o.id)) summaryRows.push({ label, name: o.name, price: o.price }) })
    MEAL_OPTIONS.forEach(o => { if (a.meals.has(o.id)) summaryRows.push({ label, name: o.name, price: o.price }) })
    PRIORITY_OPTIONS.forEach(o => { if (a.priority.has(o.id)) summaryRows.push({ label, name: o.name, price: o.price }) })
  })

  return (
    <>
      <style>{css}</style>
      <div className="as-root">
        <div className="as-container">

          <div className="as-header">
            <span className="as-header__tag">Bước 3 / 3 — Dịch vụ bổ sung</span>
            <div className="as-header__title">Thêm tiện ích<br />cho chuyến bay</div>
            <div className="as-header__sub">Tuỳ chọn không bắt buộc — bạn có thể bỏ qua và check-in ngay</div>
          </div>

          {bookings.length > 1 && (
            <div className="as-flights">
              {bookings.map((b, i) => (
                <button
                  key={b.id}
                  className={`as-ftab${flightIdx === i ? ' active' : ''}`}
                  onClick={() => setFlightIdx(i)}
                >
                  ✈ {b.depCode}→{b.arrCode} · {b.date}
                </button>
              ))}
            </div>
          )}

          <div className="as-section">
            <div className="as-section__header">
              <div className="as-section__icon">🧳</div>
              <div>
                <div className="as-section__title">Hành lý ký gửi</div>
                <div className="as-section__sub">Chọn thêm ký gửi nếu cần</div>
              </div>
            </div>
            <div className="as-cards">
              {BAGGAGE_OPTIONS.map(o => (
                <div
                  key={o.id}
                  className={`as-card${fa.baggage.has(o.id) ? ' selected' : ''}`}
                  onClick={() => toggle('baggage', o.id)}
                >
                  <span className="as-card__emoji">{o.emoji}</span>
                  <div className="as-card__name">{o.name}</div>
                  <div className="as-card__desc">{o.desc}</div>
                  <div className="as-card__price">{fmt(o.price)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="as-section">
            <div className="as-section__header">
              <div className="as-section__icon">🍽️</div>
              <div>
                <div className="as-section__title">Đặt bữa ăn</div>
                <div className="as-section__sub">Chọn trước để đảm bảo phần ăn yêu thích</div>
              </div>
            </div>
            <div className="as-meal-grid">
              {MEAL_OPTIONS.map(o => (
                <div
                  key={o.id}
                  className={`as-meal-card${fa.meals.has(o.id) ? ' selected' : ''}`}
                  onClick={() => toggle('meals', o.id)}
                >
                  <div className="as-meal-card__img">{o.emoji}</div>
                  <div className="as-meal-card__body">
                    <div className="as-meal-card__name">
                      {o.name}
                      {fa.meals.has(o.id) && <span className="as-meal-selected-badge">Đã chọn</span>}
                    </div>
                    <div className="as-meal-card__type">{o.type}</div>
                    <div className="as-meal-card__price">{fmt(o.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="as-section">
            <div className="as-section__header">
              <div className="as-section__icon">⭐</div>
              <div>
                <div className="as-section__title">Dịch vụ ưu tiên</div>
                <div className="as-section__sub">Nâng cao trải nghiệm của bạn</div>
              </div>
            </div>
            <div className="as-cards">
              {PRIORITY_OPTIONS.map(o => (
                <div
                  key={o.id}
                  className={`as-card${fa.priority.has(o.id) ? ' selected' : ''}`}
                  onClick={() => toggle('priority', o.id)}
                >
                  <span className="as-card__emoji">{o.emoji}</span>
                  <div className="as-card__name">{o.name}</div>
                  <div className="as-card__desc">{o.desc}</div>
                  <div className="as-card__price">{fmt(o.price)}</div>
                </div>
              ))}
            </div>
          </div>

          {hasAny && (
            <div className="as-summary">
              <div className="as-summary__title">🛒 Dịch vụ đã chọn</div>
              {summaryRows.map((r, i) => (
                <div key={i} className="as-sum-row">
                  <span><b>{r.label}</b> · {r.name}</span>
                  <span>{fmt(r.price)}</span>
                </div>
              ))}
              <div className="as-sum-total">
                <span>Tổng phụ phí</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          )}

          <div className="as-skip-note">
            {!hasAny && 'Không chọn dịch vụ nào — có thể check-in ngay'}
          </div>

          <div className="as-bar">
            <button className="as-back-btn" onClick={onBack}>← Quay lại</button>
            <button className="as-checkin-btn" onClick={() => onNext({ bookings, addons, total })}>
              ✅ Xác nhận Check-in
            </button>
          </div>

        </div>
      </div>
    </>
  )
}