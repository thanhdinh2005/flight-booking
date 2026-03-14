// src/components/checkin/SeatSelector.jsx
// Aesthetic: Việt Jett — teal & white, clean technical layout
import { useState } from 'react'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@400;600;700;800&display=swap');

  .ss-root {
    font-family: 'Syne', sans-serif;
    background: #f0fafa;
    min-height: 100vh;
    padding: 32px 20px 52px;
    --bg: #f0fafa;
    --card: #ffffff;
    --teal: #2aabab;
    --teal-dark: #1e8888;
    --teal-dim: rgba(42,171,171,0.10);
    --teal-mid: rgba(42,171,171,0.22);
    --ink: #1a2a2a;
    --muted: #5a7a7a;
    --border: rgba(42,171,171,0.22);
    --taken: #d8eded;
    --taken-txt: #9bbebe;
    --selected: #2aabab;
    --available: rgba(42,171,171,0.10);
    --available-hover: rgba(42,171,171,0.26);
  }

  .ss-container { max-width: 900px; margin: 0 auto; }

  /* Header */
  .ss-header {
    display: flex; align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
  }
  .ss-header__left {}
  .ss-header__eyebrow {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 3px;
    text-transform: uppercase; color: var(--teal);
    margin-bottom: 4px;
  }
  .ss-header__title {
    font-size: 26px; font-weight: 800;
    color: var(--ink); letter-spacing: -.3px; line-height: 1.1;
  }
  .ss-header__sub { font-size: 13px; color: var(--muted); margin-top: 4px; }

  /* Flight tabs */
  .ss-tabs {
    display: flex; gap: 0; margin-bottom: 28px;
    border-bottom: 1px solid var(--border);
  }
  .ss-tab {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; letter-spacing: 1px;
    text-transform: uppercase;
    padding: 10px 20px;
    border: none; background: transparent;
    color: var(--muted); cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all .15s;
  }
  .ss-tab.active {
    color: var(--teal); border-bottom-color: var(--teal);
  }

  /* Layout: plane + legend */
  .ss-layout {
    display: grid;
    grid-template-columns: 1fr 220px;
    gap: 24px;
    align-items: start;
  }

  /* Plane wrap */
  .ss-plane-wrap {
    background: #fff;
    border: 1px solid var(--border);
    padding: 24px 20px;
    position: relative;
    border-radius: 12px;
  }
  .ss-plane-wrap::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--teal), transparent);
    border-radius: 12px 12px 0 0;
  }

  /* Row labels */
  .ss-plane {
    display: flex; flex-direction: column; gap: 5px;
  }
  .ss-header-row {
    display: flex; align-items: center;
    gap: 0; margin-bottom: 4px;
  }
  .ss-col-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; font-weight: 600;
    letter-spacing: 1px; color: var(--teal);
    text-align: center;
    flex: 1;
  }
  .ss-row-num-space { width: 32px; flex-shrink: 0; }
  .ss-aisle-space { width: 20px; flex-shrink: 0; }

  .ss-seat-row {
    display: flex; align-items: center; gap: 0;
  }
  .ss-row-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; color: var(--muted);
    width: 32px; flex-shrink: 0; text-align: center;
  }
  .ss-aisle { width: 20px; flex-shrink: 0; }
  .ss-divider {
    height: 1px; background: var(--border);
    margin: 4px 0;
  }

  /* Seat */
  .ss-seat {
    flex: 1;
    aspect-ratio: 1;
    max-width: 38px;
    border: 1px solid;
    display: flex; align-items: center; justify-content: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px; font-weight: 600;
    cursor: pointer;
    transition: all .12s;
    position: relative;
    margin: 1px;
    border-radius: 4px;
  }
  .ss-seat--available {
    background: var(--available);
    border-color: rgba(42,171,171,0.28);
    color: var(--teal);
  }
  .ss-seat--available:hover {
    background: var(--available-hover);
    border-color: var(--teal);
    transform: scale(1.08);
    z-index: 1;
  }
  .ss-seat--taken {
    background: var(--taken);
    border-color: var(--taken-txt);
    color: var(--taken-txt);
    cursor: not-allowed;
  }
  .ss-seat--selected {
    background: var(--teal-dim);
    border-color: var(--teal);
    color: var(--teal);
    box-shadow: 0 0 10px rgba(42,171,171,0.28);
    transform: scale(1.05);
    z-index: 1;
  }
  .ss-seat--extra-legroom {
    border-style: dashed;
  }

  /* Legend + pax panel */
  .ss-sidebar {}
  .ss-legend {
    background: #fff;
    border: 1px solid var(--border);
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 10px;
  }
  .ss-legend__title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 12px;
  }
  .ss-legend-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: var(--muted); margin-bottom: 8px;
  }
  .ss-legend-dot {
    width: 14px; height: 14px; border: 1px solid; flex-shrink: 0;
    border-radius: 3px;
  }
  .ss-legend-dot--av   { background: var(--available);   border-color: rgba(42,171,171,.28); }
  .ss-legend-dot--tk   { background: var(--taken);        border-color: var(--taken-txt); }
  .ss-legend-dot--sel  { background: var(--teal-dim);     border-color: var(--teal); }
  .ss-legend-dot--leg  { background: var(--available);    border-color: rgba(42,171,171,.28); border-style: dashed; }

  /* Pax list */
  .ss-pax-panel {
    background: #fff;
    border: 1px solid var(--border);
    padding: 16px;
    border-radius: 10px;
  }
  .ss-pax-panel__title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 12px;
  }
  .ss-pax-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(42,171,171,.10);
    font-size: 12px;
    cursor: pointer;
    transition: color .12s;
  }
  .ss-pax-item:last-child { border-bottom: none; }
  .ss-pax-item.active-pax { color: var(--teal); }
  .ss-pax-item__name { font-weight: 600; color: var(--ink); font-size: 11px; }
  .ss-pax-item.active-pax .ss-pax-item__name { color: var(--teal); }
  .ss-pax-item__seat {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px; font-weight: 600;
    color: var(--teal);
  }
  .ss-pax-item__seat--none { color: var(--muted); font-size: 11px; }
  .ss-pax-arrow {
    font-size: 10px; color: var(--teal); margin-left: 4px;
    opacity: 0; transition: opacity .12s;
  }
  .ss-pax-item.active-pax .ss-pax-arrow { opacity: 1; }

  /* Bottom bar */
  .ss-bar {
    margin-top: 24px;
    display: flex; align-items: center;
    justify-content: space-between;
    flex-wrap: wrap; gap: 14px;
    border-top: 1px solid var(--border);
    padding-top: 20px;
  }
  .ss-progress {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; color: var(--muted); letter-spacing: 1px;
  }
  .ss-back-btn {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 600;
    padding: 10px 20px;
    border: 1.5px solid var(--border);
    background: transparent; color: var(--muted);
    cursor: pointer; border-radius: 8px;
    transition: all .15s;
  }
  .ss-back-btn:hover { border-color: var(--teal); color: var(--teal); }
  .ss-next-btn {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700;
    padding: 12px 28px;
    background: var(--teal);
    color: #fff;
    border: none;
    cursor: pointer; border-radius: 8px;
    transition: background .15s, transform .1s, opacity .15s;
  }
  .ss-next-btn:hover:not(:disabled) { background: var(--teal-dark); }
  .ss-next-btn:active:not(:disabled) { transform: scale(.98); }
  .ss-next-btn:disabled { opacity: .45; cursor: not-allowed; }

  @media (max-width: 700px) {
    .ss-layout { grid-template-columns: 1fr; }
    .ss-sidebar { display: flex; gap: 12px; }
    .ss-legend, .ss-pax-panel { flex: 1; }
  }
`

function generateSeatMap() {
  const rows = []
  const takenSet = new Set([
    '2A','2C','3B','5A','5F','7D','7E','8B','8C',
    '10A','11E','12F','14A','15C','16D','18B','20E','22A','23F',
    '25B','26C','27A','28F','29D','30E',
  ])
  for (let r = 1; r <= 30; r++) {
    const seats = ['A','B','C','D','E','F'].map(col => ({
      id: `${r}${col}`, row: r, col,
      taken: takenSet.has(`${r}${col}`),
      extraLegroom: r === 12 || r === 13,
    }))
    rows.push({ row: r, seats })
  }
  return rows
}

const SEAT_MAP = generateSeatMap()

export default function SeatSelector({ bookings, onNext, onBack }) {
  const [flightIdx, setFlightIdx] = useState(0)

  const [assignments, setAssignments] = useState(() => {
    const init = {}
    bookings.forEach(b => {
      init[b.id] = {}
      b.passengers.forEach(p => { init[b.id][p.name] = null })
    })
    return init
  })

  const [activePax, setActivePax] = useState(() => bookings[0]?.passengers[0]?.name || null)

  const flight = bookings[flightIdx]
  const flightAssign = assignments[flight.id]

  const takenByOthers = new Set(
    Object.entries(flightAssign)
      .filter(([, s]) => s !== null)
      .map(([, s]) => s)
  )

  function handleSeatClick(seat) {
    if (!activePax) return
    if (seat.taken) return
    if (takenByOthers.has(seat.id) && flightAssign[activePax] !== seat.id) return

    setAssignments(prev => ({
      ...prev,
      [flight.id]: {
        ...prev[flight.id],
        [activePax]: prev[flight.id][activePax] === seat.id ? null : seat.id,
      },
    }))

    const paxList = flight.passengers.map(p => p.name)
    const currentIdx = paxList.indexOf(activePax)
    const nextUnassigned = paxList.find((p, i) =>
      i > currentIdx && !assignments[flight.id][p]
    )
    if (nextUnassigned) setActivePax(nextUnassigned)
  }

  function seatState(seat) {
    if (seat.taken) return 'taken'
    const allSelected = Object.values(flightAssign)
    if (allSelected.includes(seat.id)) return 'selected'
    if (takenByOthers.has(seat.id)) return 'taken'
    return 'available'
  }

  const totalPax = bookings.reduce((s, b) => s + b.passengers.length, 0)
  const totalAssigned = bookings.reduce((s, b) => {
    return s + Object.values(assignments[b.id]).filter(Boolean).length
  }, 0)
  const allAssigned = totalAssigned === totalPax

  function buildResult() {
    return bookings.map(b => ({
      ...b,
      passengers: b.passengers.map(p => ({
        ...p,
        seat: assignments[b.id][p.name],
      })),
    }))
  }

  const leftCols  = ['A','B','C']
  const rightCols = ['D','E','F']

  return (
    <>
      <style>{css}</style>
      <div className="ss-root">
        <div className="ss-container">

          <div className="ss-header">
            <div className="ss-header__left">
              <div className="ss-header__eyebrow">Bước 2 / 3 — Seat Selection</div>
              <div className="ss-header__title">Chọn ghế ngồi</div>
              <div className="ss-header__sub">
                Click vào hành khách → click vào ghế để gán chỗ ngồi
              </div>
            </div>
          </div>

          {bookings.length > 1 && (
            <div className="ss-tabs">
              {bookings.map((b, i) => (
                <button
                  key={b.id}
                  className={`ss-tab${flightIdx === i ? ' active' : ''}`}
                  onClick={() => {
                    setFlightIdx(i)
                    setActivePax(b.passengers[0]?.name)
                  }}
                >
                  {b.depCode}→{b.arrCode} · {b.date}
                </button>
              ))}
            </div>
          )}

          <div className="ss-layout">
            <div className="ss-plane-wrap">
              <div className="ss-header-row">
                <div className="ss-row-num-space" />
                {leftCols.map(c => <div key={c} className="ss-col-label">{c}</div>)}
                <div className="ss-aisle-space" />
                {rightCols.map(c => <div key={c} className="ss-col-label">{c}</div>)}
              </div>

              <div className="ss-plane">
                {SEAT_MAP.map(({ row, seats }) => (
                  <div key={row}>
                    {(row === 5 || row === 15 || row === 25) && <div className="ss-divider" />}
                    <div className="ss-seat-row">
                      <div className="ss-row-num">{row}</div>
                      {leftCols.map(col => {
                        const seat = seats.find(s => s.col === col)
                        const state = seatState(seat)
                        return (
                          <div
                            key={seat.id}
                            className={`ss-seat ss-seat--${state}${seat.extraLegroom ? ' ss-seat--extra-legroom' : ''}`}
                            onClick={() => handleSeatClick(seat)}
                            title={seat.extraLegroom ? 'Extra legroom' : seat.id}
                          >
                            {state === 'selected'
                              ? Object.entries(flightAssign).find(([,s])=>s===seat.id)?.[0]?.charAt(0) || '✓'
                              : state === 'taken' ? '×' : ''}
                          </div>
                        )
                      })}
                      <div className="ss-aisle" />
                      {rightCols.map(col => {
                        const seat = seats.find(s => s.col === col)
                        const state = seatState(seat)
                        return (
                          <div
                            key={seat.id}
                            className={`ss-seat ss-seat--${state}${seat.extraLegroom ? ' ss-seat--extra-legroom' : ''}`}
                            onClick={() => handleSeatClick(seat)}
                            title={seat.extraLegroom ? 'Extra legroom' : seat.id}
                          >
                            {state === 'selected'
                              ? Object.entries(flightAssign).find(([,s])=>s===seat.id)?.[0]?.charAt(0) || '✓'
                              : state === 'taken' ? '×' : ''}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ss-sidebar">
              <div className="ss-legend">
                <div className="ss-legend__title">Chú thích</div>
                {[
                  ['av', 'Ghế trống'],
                  ['tk', 'Đã có người'],
                  ['sel','Đã chọn'],
                  ['leg','Extra legroom'],
                ].map(([k, l]) => (
                  <div key={k} className="ss-legend-item">
                    <div className={`ss-legend-dot ss-legend-dot--${k}`} />
                    <span>{l}</span>
                  </div>
                ))}
              </div>

              <div className="ss-pax-panel">
                <div className="ss-pax-panel__title">
                  {flight.depCode}→{flight.arrCode} · Hành khách
                </div>
                {flight.passengers.map(p => (
                  <div
                    key={p.name}
                    className={`ss-pax-item${activePax === p.name ? ' active-pax' : ''}`}
                    onClick={() => setActivePax(p.name)}
                  >
                    <div>
                      <div className="ss-pax-item__name">{p.name.split(' ').slice(-2).join(' ')}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 1 }}>
                        {p.class}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className={`ss-pax-item__seat${!flightAssign[p.name] ? ' ss-pax-item__seat--none' : ''}`}>
                        {flightAssign[p.name] || '—'}
                      </span>
                      <span className="ss-pax-arrow">◀</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ss-bar">
            <div>
              <button className="ss-back-btn" onClick={onBack}>← Quay lại</button>
              <div className="ss-progress" style={{ marginTop: 6 }}>
                {totalAssigned}/{totalPax} ghế đã chọn
              </div>
            </div>
            <button
              className="ss-next-btn"
              disabled={!allAssigned}
              onClick={() => onNext(buildResult())}
            >
              Chọn dịch vụ →
            </button>
          </div>

        </div>
      </div>
    </>
  )
}