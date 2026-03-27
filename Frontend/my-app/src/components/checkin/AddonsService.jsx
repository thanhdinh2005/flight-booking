// src/components/checkin/AddonsService.jsx
// Kết nối API: GET /api/getAddon  |  POST /api/updateAddon
import { useState, useEffect, useCallback, useMemo } from 'react'

const BASE_URL = 'https://backend.test/api'
import { getAccessToken } from '../../services/keycloakService'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Lora:ital,wght@0,500;1,400&display=swap');

  .as-root {
    font-family: 'Nunito', sans-serif;
    background: #f0ede6;
    min-height: 100vh;
    padding: 32px 20px 56px;
    --cream: #f0ede6;
    --card: #faf8f3;
    --sage: #5a7a5e;
    --sage-light: #e6efe7;
    --sage-mid: rgba(90,122,94,0.25);
    --terracotta: #c26b4a;
    --ink: #2a2520;
    --muted: #8a7f74;
    --border: #ddd7cc;
    --red: #c0392b;
  }

  .as-container { max-width: 680px; margin: 0 auto; }

  /* ── Steps (identique à PassengerForm) ── */
  .as-steps {
    display: flex; align-items: center;
    margin-bottom: 32px; gap: 0;
  }
  .as-step {
    display: flex; flex-direction: column;
    align-items: center; gap: 5px; flex: 1;
  }
  .as-step__circle {
    width: 34px; height: 34px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 13px; transition: all .25s;
  }
  .as-step__circle--done   { background: var(--sage); color: #fff; }
  .as-step__circle--active { background: var(--ink);  color: #fff; box-shadow: 0 0 0 4px rgba(90,122,94,.2); }
  .as-step__circle--idle   { background: #ddd7cc; color: var(--muted); }
  .as-step__label {
    font-size: 10px; font-weight: 700; letter-spacing: .5px;
    text-transform: uppercase; color: var(--muted); white-space: nowrap;
  }
  .as-step__label--active { color: var(--ink); }
  .as-step-line {
    flex: 1; height: 2px; background: var(--border);
    margin-bottom: 17px; transition: background .25s;
  }
  .as-step-line--done { background: var(--sage); }

  /* ── Flight pill ── */
  .as-flight-pill {
    background: var(--sage-light);
    border: 1.5px solid #b8d1ba;
    border-radius: 100px;
    padding: 10px 20px;
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
    margin-bottom: 24px;
    font-size: 13px; font-weight: 600; color: var(--sage);
  }
  .as-flight-pill__sep { color: #b8d1ba; }

  /* Loading */
  .as-loading {
    display: flex; flex-direction: column; align-items: center;
    gap: 12px; padding: 48px 0; color: var(--muted); font-size: 14px;
  }
  .as-spinner {
    width: 34px; height: 34px;
    border: 3px solid var(--border);
    border-top-color: var(--sage);
    border-radius: 50%;
    animation: as-spin .7s linear infinite;
  }
  @keyframes as-spin { to { transform: rotate(360deg); } }

  /* Error */
  .as-error {
    background: #fef2f2; border: 1.5px solid #f5c6c6;
    border-radius: 12px; padding: 14px 18px;
    color: var(--red); font-size: 13px;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px;
  }
  .as-error button {
    margin-left: auto; background: var(--red); color: #fff;
    border: none; border-radius: 6px;
    padding: 5px 12px; font-size: 12px; cursor: pointer;
  }

  /* Per-flight tabs */
  .as-flights { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .as-ftab {
    font-family: 'Nunito', sans-serif;
    font-size: 12px; font-weight: 700;
    padding: 7px 16px;
    border: 1.5px solid var(--border);
    background: var(--card); color: var(--muted);
    cursor: pointer; border-radius: 100px; transition: all .15s;
  }
  .as-ftab.active {
    border-color: var(--sage);
    background: var(--sage-light); color: var(--sage);
  }

  /* Section */
  .as-section { margin-bottom: 28px; }
  .as-section__header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
  }
  .as-section__icon {
    width: 36px; height: 36px;
    background: var(--sage-light); border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .as-section__title {
    font-family: 'Lora', serif;
    font-size: 17px; font-weight: 500; color: var(--ink); line-height: 1;
  }
  .as-section__sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

  /* Card container — dùng pf-card style */
  .as-card-wrap {
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 20px;
    padding: 18px 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,.04);
  }

  /* Service cards grid */
  .as-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }
  .as-card {
    background: #fdfcf9;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 14px;
    cursor: pointer;
    transition: all .18s;
    position: relative; overflow: hidden;
  }
  .as-card:hover {
    border-color: var(--sage-mid);
    box-shadow: 0 4px 16px rgba(90,122,94,0.12);
    transform: translateY(-2px);
  }
  .as-card.selected {
    border-color: var(--sage);
    background: var(--sage-light);
    box-shadow: 0 4px 16px rgba(90,122,94,0.18);
  }
  .as-card.selected::before {
    content: '✓';
    position: absolute; top: 9px; right: 9px;
    width: 18px; height: 18px;
    background: var(--sage); color: #fff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800;
    line-height: 18px; text-align: center;
  }
  .as-card.updating { opacity: 0.55; pointer-events: none; }
  .as-card__emoji { font-size: 22px; margin-bottom: 8px; display: block; }
  .as-card__name {
    font-size: 13px; font-weight: 700; color: var(--ink);
    margin-bottom: 4px; line-height: 1.3;
  }
  .as-card__desc { font-size: 11px; color: var(--muted); margin-bottom: 8px; line-height: 1.4; }
  .as-card__price {
    font-family: 'Lora', serif;
    font-size: 15px; font-weight: 500; color: var(--sage);
  }

  /* Meal grid */
  .as-meal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 10px;
  }
  .as-meal-card {
    background: #fdfcf9;
    border: 1.5px solid var(--border);
    border-radius: 14px; overflow: hidden;
    cursor: pointer; transition: all .18s; position: relative;
  }
  .as-meal-card:hover {
    border-color: var(--sage-mid);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(90,122,94,.12);
  }
  .as-meal-card.selected { border-color: var(--sage); background: var(--sage-light); }
  .as-meal-card.updating { opacity: 0.55; pointer-events: none; }
  .as-meal-card__img {
    height: 72px;
    display: flex; align-items: center; justify-content: center;
    font-size: 40px; background: var(--sage-light);
  }
  .as-meal-card.selected .as-meal-card__img { background: rgba(90,122,94,0.22); }
  .as-meal-card__body { padding: 10px 12px; }
  .as-meal-card__name { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
  .as-meal-card__type {
    font-size: 10px; color: var(--muted); text-transform: uppercase;
    letter-spacing: .5px; margin-bottom: 6px;
  }
  .as-meal-card__price {
    font-family: 'Lora', serif; font-size: 14px; font-weight: 500; color: var(--sage);
  }
  .as-meal-selected-badge {
    display: inline-block; background: var(--sage); color: #fff;
    font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    padding: 2px 7px; border-radius: 100px; margin-left: 6px;
  }

  /* Toast */
  .as-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 999;
    background: var(--ink); color: #fff;
    padding: 10px 18px; border-radius: 10px;
    font-size: 13px; font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    animation: as-slideIn .25s ease;
  }
  .as-toast.success { background: var(--sage); }
  .as-toast.error   { background: var(--red); }
  @keyframes as-slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Summary */
  .as-summary {
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 20px;
    padding: 20px 24px;
    margin-top: 24px; margin-bottom: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,.04);
  }
  .as-summary__title {
    font-family: 'Lora', serif;
    font-size: 17px; font-weight: 500; color: var(--ink);
    margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
  }
  .as-sum-row {
    display: flex; justify-content: space-between;
    font-size: 13px; color: var(--muted);
    padding: 8px 0; border-bottom: 1px dashed var(--border);
  }
  .as-sum-row:last-of-type { border-bottom: none; }
  .as-sum-row b { color: var(--ink); font-weight: 700; }
  .as-sum-total {
    display: flex; justify-content: space-between;
    font-size: 20px; font-weight: 800; color: var(--ink);
    padding-top: 14px; border-top: 1.5px solid var(--border); margin-top: 4px;
  }
  .as-sum-total span:first-child {
    font-size: 13px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .5px;
    color: var(--muted); align-self: center;
  }

  /* Bottom bar */
  .as-bar {
    display: flex; gap: 12px; align-items: center;
    position: sticky; bottom: 0;
    background: rgba(240,237,230,0.92);
    backdrop-filter: blur(8px);
    padding: 16px 0 8px; margin-top: 8px;
  }
  .as-back-btn {
    font-family: 'Nunito', sans-serif;
    background: transparent; border: 1.5px solid var(--border);
    color: var(--muted); padding: 12px 20px;
    border-radius: 12px; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all .15s;
  }
  .as-back-btn:hover { border-color: var(--ink); color: var(--ink); }
  .as-checkin-btn {
    flex: 1; font-family: 'Nunito', sans-serif;
    background: var(--ink); color: var(--cream);
    border: none; padding: 13px 32px;
    border-radius: 12px; font-size: 14px; font-weight: 800;
    cursor: pointer; transition: background .15s; letter-spacing: .2px;
  }
  .as-checkin-btn:hover { background: var(--sage); }
  .as-checkin-btn:active { transform: scale(.98); }
  .as-skip-note {
    font-size: 11px; color: var(--muted);
    text-align: right; margin-bottom: 4px; font-style: italic;
  }

  @media (max-width: 520px) {
    .as-cards      { grid-template-columns: 1fr 1fr; }
    .as-meal-grid  { grid-template-columns: 1fr 1fr; }
    .as-flight-pill { border-radius: 16px; }
  }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  return Number(n).toLocaleString('vi-VN') + '₫'
}

function getEmoji(type) {
  if (type === 'LUGGAGE') return '🧳'
  if (type === 'MEAL')    return '🍽️'
  return '⭐'
}

// ─── API calls ────────────────────────────────────────────────────────────────
async function fetchAddons() {
  const token = getAccessToken()

  const res = await fetch(`${BASE_URL}/getAddon`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })

  if (!res.ok) throw new Error(`Lỗi server: ${res.status}`)
  
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Không lấy được danh sách dịch vụ')
  
  return json.data
}

async function updateAddon({ ticket_id, addon_id, quantity }) {
  const token = getAccessToken()

  if (!token) {
    throw new Error('Chưa đăng nhập')
  }

  const res = await fetch(`${BASE_URL}/updateAddon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ticket_id, addon_id, quantity }),
  })

  if (!res.ok) throw new Error(`Lỗi cập nhật: ${res.status}`)

  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Cập nhật dịch vụ thất bại')

  return json
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  return <div className={`as-toast ${type}`}>{message}</div>
}

// ─── Step indicator — 3 bước: Thông tin ✓ → Dịch vụ (active) → Thanh toán ───
const STEPS = ['Thông tin', 'Dịch vụ', 'Thanh toán']

function StepBar({ active }) {
  return (
    <div className="as-steps">
      {STEPS.map((label, i) => {
        const state = i < active ? 'done' : i === active ? 'active' : 'idle'
        return (
          <>
            <div className="as-step" key={i}>
              <div className={`as-step__circle as-step__circle--${state}`}>
                {state === 'done' ? '✓' : i + 1}
              </div>
              <span className={`as-step__label${state === 'active' ? ' as-step__label--active' : ''}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`as-step-line${state === 'done' ? ' as-step-line--done' : ''}`} key={`line-${i}`} />
            )}
          </>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddonsService({ bookings, onNext, onBack }) {
  const [flightIdx,    setFlightIdx]    = useState(0)
  const [apiAddons,    setApiAddons]    = useState([])   // raw from API
  const [loading,      setLoading]      = useState(true)
  const [fetchError,   setFetchError]   = useState(null)
  // selected: { [bookingId]: Set<addon_id> }
  const [selected,     setSelected]     = useState(() => {
    const init = {}
    bookings.forEach(b => { init[b.id] = new Set() })
    return init
  })
  // updating: Set of `${bookingId}:${addonId}` keys being saved
  const [updating,     setUpdating]     = useState(new Set())
  const [toast,        setToast]        = useState(null)
  const addonsById = useMemo(
    () => Object.fromEntries(apiAddons.map(addon => [addon.id, addon])),
    [apiAddons]
  )

  // ── Load addons on mount ──
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFetchError(null)
    fetchAddons()
      .then(data => { if (!cancelled) setApiAddons(data) })
      .catch(err  => { if (!cancelled) setFetchError(err.message) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // ── Show toast ──
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  // ── Toggle addon: only one choice per addon type for each ticket ──
  const toggle = useCallback(async (bookingId, addonId) => {
    const currentSet = selected[bookingId] ?? new Set()
    const addon = addonsById[addonId]
    if (!addon) return

    const sameTypeIds = apiAddons
      .filter(item => item.type === addon.type)
      .map(item => item.id)
    const replacedIds = sameTypeIds.filter(id => id !== addonId && currentSet.has(id))
    const wasSelected = currentSet.has(addonId)
    const nextSet = new Set(currentSet)

    if (wasSelected) {
      nextSet.delete(addonId)
    } else {
      replacedIds.forEach(id => nextSet.delete(id))
      nextSet.add(addonId)
    }

    const previousSet = new Set(currentSet)
    const updatingKeys = [addonId, ...replacedIds].map(id => `${bookingId}:${id}`)

    setSelected(prev => ({ ...prev, [bookingId]: nextSet }))
    setUpdating(prev => {
      const next = new Set(prev)
      updatingKeys.forEach(key => next.add(key))
      return next
    })

    try {
      if (wasSelected) {
        await updateAddon({ ticket_id: bookingId, addon_id: addonId, quantity: 0 })
        showToast('🗑 Đã bỏ dịch vụ', 'success')
      } else {
        for (const replacedId of replacedIds) {
          await updateAddon({ ticket_id: bookingId, addon_id: replacedId, quantity: 0 })
        }
        await updateAddon({ ticket_id: bookingId, addon_id: addonId, quantity: 1 })
        showToast(replacedIds.length > 0 ? '✅ Đã đổi sang dịch vụ mới' : '✅ Đã thêm dịch vụ', 'success')
      }
    } catch (err) {
      setSelected(prev => ({ ...prev, [bookingId]: previousSet }))

      if (!wasSelected && replacedIds.length > 0) {
        await Promise.allSettled([
          updateAddon({ ticket_id: bookingId, addon_id: addonId, quantity: 0 }),
          ...replacedIds.map(replacedId =>
            updateAddon({ ticket_id: bookingId, addon_id: replacedId, quantity: 1 })
          ),
        ])
      }

      showToast('⚠️ ' + err.message, 'error')
    } finally {
      setUpdating(prev => {
        const next = new Set(prev)
        updatingKeys.forEach(key => next.delete(key))
        return next
      })
    }
  }, [addonsById, apiAddons, selected, showToast])

  // ── Derived data ──
  const flight   = bookings[flightIdx]
  const faSet    = selected[flight.id] ?? new Set()

  const luggage  = apiAddons.filter(a => a.type === 'LUGGAGE')
  const meals    = apiAddons.filter(a => a.type === 'MEAL')
  const services = apiAddons.filter(a => a.type === 'SERVICE')

  // ── Total across all bookings ──
  const total = bookings.reduce((sum, b) => {
    const bSet = selected[b.id] ?? new Set()
    return sum + apiAddons.reduce((s, a) => s + (bSet.has(a.id) ? parseFloat(a.price) : 0), 0)
  }, 0)

  const summaryRows = []
  bookings.forEach(b => {
    const bSet = selected[b.id] ?? new Set()
    const label = `${b.depCode}→${b.arrCode}`
    apiAddons.forEach(a => {
      if (bSet.has(a.id)) summaryRows.push({ label, name: a.name, price: parseFloat(a.price) })
    })
  })
  const hasAny = summaryRows.length > 0

  // ── Render card (LUGGAGE / SERVICE) ──
  function AddonCard({ addon }) {
    const isSelected = faSet.has(addon.id)
    const isUpdating = updating.has(`${flight.id}:${addon.id}`)
    return (
      <div
        className={`as-card${isSelected ? ' selected' : ''}${isUpdating ? ' updating' : ''}`}
        onClick={() => toggle(flight.id, addon.id)}
      >
        <span className="as-card__emoji">{getEmoji(addon.type)}</span>
        <div className="as-card__name">{addon.name}</div>
        {addon.description && <div className="as-card__desc">{addon.description}</div>}
        <div className="as-card__price">{fmt(addon.price)}</div>
      </div>
    )
  }

  // ── Render meal card ──
  function MealCard({ addon }) {
    const isSelected = faSet.has(addon.id)
    const isUpdating = updating.has(`${flight.id}:${addon.id}`)
    return (
      <div
        className={`as-meal-card${isSelected ? ' selected' : ''}${isUpdating ? ' updating' : ''}`}
        onClick={() => toggle(flight.id, addon.id)}
      >
        <div className="as-meal-card__img">🍽️</div>
        <div className="as-meal-card__body">
          <div className="as-meal-card__name">
            {addon.name}
            {isSelected && <span className="as-meal-selected-badge">Đã chọn</span>}
          </div>
          <div className="as-meal-card__type">Suất ăn trên máy bay</div>
          <div className="as-meal-card__price">{fmt(addon.price)}</div>
        </div>
      </div>
    )
  }

  // ── Loading state ──
  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="as-root">
          <div className="as-container">
            {/* Steps */}
            <StepBar active={1} />
            <div className="as-loading">
              <div className="as-spinner" />
              Đang tải danh sách dịch vụ…
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div className="as-root">
        <div className="as-container">

          {/* Step indicator — bước 2/3, giống PassengerForm */}
          <StepBar active={1} />

          {/* Flight pill */}
          {bookings.length > 0 && (
            <div className="as-flight-pill">
              <span>✈️ {flight.depCode} → {flight.arrCode}</span>
              <span className="as-flight-pill__sep">·</span>
              <span>{flight.date}</span>
              {bookings.length > 1 && (
                <><span className="as-flight-pill__sep">·</span>
                <span>{bookings.length} chuyến</span></>
              )}
            </div>
          )}

          {/* API error banner */}
          {fetchError && (
            <div className="as-error">
              ⚠️ {fetchError}
              <button onClick={() => {
                setFetchError(null); setLoading(true)
                fetchAddons().then(setApiAddons).catch(e => setFetchError(e.message)).finally(() => setLoading(false))
              }}>Thử lại</button>
            </div>
          )}

          {/* Flight tabs (nếu nhiều chuyến) */}
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

          {/* ── LUGGAGE ── */}
          {luggage.length > 0 && (
            <div className="as-section">
              <div className="as-section__header">
                <div className="as-section__icon">🧳</div>
                <div>
                  <div className="as-section__title">Hành lý ký gửi</div>
                  <div className="as-section__sub">Chọn thêm ký gửi nếu cần</div>
                </div>
              </div>
              <div className="as-card-wrap">
                <div className="as-cards">
                  {luggage.map(a => <AddonCard key={a.id} addon={a} />)}
                </div>
              </div>
            </div>
          )}

          {/* ── MEAL ── */}
          {meals.length > 0 && (
            <div className="as-section">
              <div className="as-section__header">
                <div className="as-section__icon">🍽️</div>
                <div>
                  <div className="as-section__title">Đặt bữa ăn</div>
                  <div className="as-section__sub">Chọn trước để đảm bảo phần ăn yêu thích</div>
                </div>
              </div>
              <div className="as-card-wrap">
                <div className="as-meal-grid">
                  {meals.map(a => <MealCard key={a.id} addon={a} />)}
                </div>
              </div>
            </div>
          )}

          {/* ── SERVICE ── */}
          {services.length > 0 && (
            <div className="as-section">
              <div className="as-section__header">
                <div className="as-section__icon">⭐</div>
                <div>
                  <div className="as-section__title">Dịch vụ ưu tiên</div>
                  <div className="as-section__sub">Nâng cao trải nghiệm của bạn</div>
                </div>
              </div>
              <div className="as-card-wrap">
                <div className="as-cards">
                  {services.map(a => <AddonCard key={a.id} addon={a} />)}
                </div>
              </div>
            </div>
          )}

          {/* ── Summary ── */}
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
            {!hasAny && 'Không chọn dịch vụ nào — có thể tiếp tục thanh toán'}
          </div>

          <div className="as-bar">
            <button className="as-back-btn" onClick={onBack}>← Quay lại</button>
            <button
              className="as-checkin-btn"
              onClick={() => onNext({ bookings, selected, total, summaryRows })}
            >
              Tiếp tục →{hasAny ? ` (+${fmt(total)})` : ''}
            </button>
          </div>

        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  )
}
