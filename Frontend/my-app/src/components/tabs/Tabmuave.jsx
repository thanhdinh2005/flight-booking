// src/components/tabs/TabMuaVe.jsx
// Kết nối: SearchPanel → FlightResults → PassengerForm (+ RefundPolicyModal)
import { useState } from 'react'
import FlightResults from '../Flightresults'
import PassengerForm from '../Passengerform'
import '../../styles/SearchPanel.css'  

// ─── Mini Calendar ──────────────────────────────────────────────────────────
const calendarCss = `
 
`

function MiniCalendar({ value, onChange, onClose }) {
  const today = new Date()
  const init = value ? new Date(value) : today
  const [yr, setYr] = useState(init.getFullYear())
  const [mo, setMo] = useState(init.getMonth())

  const firstDay = new Date(yr, mo, 1).getDay()
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const pad = cells.length % 7 ? 7 - (cells.length % 7) : 0
  for (let i = 0; i < pad; i++) cells.push(null)

  const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
  const DOWS   = ['CN','T2','T3','T4','T5','T6','T7']

  function prev() { mo === 0 ? (setYr(y => y-1), setMo(11)) : setMo(m => m-1) }
  function next() { mo === 11 ? (setYr(y => y+1), setMo(0)) : setMo(m => m+1) }

  function pick(d) {
    if (!d) return
    const date = new Date(yr, mo, d)
    if (date < new Date(today.toDateString())) return
    const iso = `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    onChange(iso)
    onClose()
  }

  const selD = value ? new Date(value) : null

  function cls(d) {
    if (!d) return 'cal-day cal-day--empty'
    const date = new Date(yr, mo, d)
    const isPast = date < new Date(today.toDateString())
    const isSel  = selD && selD.getFullYear()===yr && selD.getMonth()===mo && selD.getDate()===d
    const isToday= today.getFullYear()===yr && today.getMonth()===mo && today.getDate()===d
    return ['cal-day', isPast&&'cal-day--past', isSel&&'cal-day--selected', (!isSel&&isToday)&&'cal-day--today'].filter(Boolean).join(' ')
  }

  return (
    <div className="cal-wrap" onClick={e => e.stopPropagation()}>
      <div className="cal-nav">
        <button className="cal-nav__btn" onClick={prev}>‹</button>
        <span className="cal-nav__label">{MONTHS[mo]} {yr}</span>
        <button className="cal-nav__btn" onClick={next}>›</button>
      </div>
      <div className="cal-grid">
        {DOWS.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={cls(d)} onClick={() => pick(d)}>{d || ''}</div>
        ))}
      </div>
    </div>
  )
}

function DateField({ label, value, onChange, className }) {
  const [open, setOpen] = useState(false)
  const display = value
    ? value.split('-').reverse().join('/')
    : 'Chọn ngày'

  return (
    <div className="form-field" style={{ position: 'relative' }}>
      <style>{calendarCss}</style>
      <label className="form-field__label">{label}</label>
      <div
        className={`form-field__input ${className || ''}`}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <span>📅</span>
        <span style={{ color: value ? 'inherit' : '#9ca3af' }}>{display}</span>
      </div>
      {open && (
        <>
          {/* click outside to close */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
          <MiniCalendar value={value} onChange={onChange} onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  )
}

// ─── Search Panel ────────────────────────────────────────────────────────────
const AIRPORTS = [
  'Nội Bài (HAN) – Hà Nội',
  'Tân Sơn Nhất (SGN) – TP.HCM',
  'Đà Nẵng (DAD)',
  'Cam Ranh (CXR) – Nha Trang',
  'Phú Quốc (PQC)',
  'Liên Khương (DLI) – Đà Lạt',
  'Cần Thơ (VCA)',
  'Phú Bài (HUI) – Huế',
  'Vinh (VII)',
  'Đồng Hới (VDH)',
]

function extractCode(airport) {
  const m = airport.match(/\(([A-Z]{3})\)/)
  return m ? m[1] : airport.split(' ')[0]
}

function SearchPanel({ onSearch }) {
  const [tripType,   setTripType]   = useState('one')
  const [fromCity,   setFromCity]   = useState('Nội Bài (HAN) – Hà Nội')
  const [toCity,     setToCity]     = useState('')
  const [depDate,    setDepDate]    = useState('')
  const [retDate,    setRetDate]    = useState('')
  const [passengers, setPassengers] = useState('1')

  function swap() {
    if (!toCity) return
    setFromCity(toCity)
    setToCity(fromCity)
  }

  function handleSearch() {
    if (!toCity)   { alert('⚠️ Vui lòng chọn điểm đến!'); return }
    if (!depDate)  { alert('⚠️ Vui lòng chọn ngày đi!');  return }
    onSearch({
      from:       extractCode(fromCity),
      to:         extractCode(toCity),
      fromLabel:  fromCity,
      toLabel:    toCity,
      date:       depDate,
      retDate:    retDate,
      passengers,
      tripType,
    })
  }

  const isValid = toCity && depDate

  return (
    <div className="tab-content">
      {/* Trip type */}
      <div className="radio-group">
        {[['one','Một chiều'],['round','Khứ hồi']].map(([v, l]) => (
          <label key={v} className="radio-label">
            <input
              type="radio" name="trip" value={v}
              checked={tripType === v}
              onChange={() => setTripType(v)}
            />
            {l}
          </label>
        ))}
      </div>

      {/* From / To */}
      <div className="form-row">
        <div className="form-field">
          <label className="form-field__label">✈️ Từ</label>
          <select
            className="form-field__input"
            value={fromCity}
            onChange={e => setFromCity(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <button className="swap-btn" onClick={swap} title="Đổi chiều">⇄</button>

        <div className="form-field">
          <label className="form-field__label">🛬 Đến</label>
          <select
            className="form-field__input"
            value={toCity}
            onChange={e => setToCity(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="">-- Chọn điểm đến --</option>
            {AIRPORTS.filter(a => a !== fromCity).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates + Passengers */}
      <div className="form-row">
        <DateField
          label="📅 Ngày đi"
          value={depDate}
          onChange={setDepDate}
        />

        {tripType === 'round' && (
          <DateField
            label="📅 Ngày về"
            value={retDate}
            onChange={setRetDate}
          />
        )}

        <div className="form-field">
          <label className="form-field__label">👥 Hành khách</label>
          <select
            className="form-field__select"
            value={passengers}
            onChange={e => setPassengers(e.target.value)}
          >
            <option value="1">1 Người lớn</option>
            <option value="2">2 Người lớn</option>
            <option value="3">3 Người lớn</option>
            <option value="4">4+ Người lớn</option>
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={handleSearch}
          style={{ opacity: isValid ? 1 : 0.45, cursor: isValid ? 'pointer' : 'not-allowed' }}
        >
          Tìm chuyến bay
        </button>
      </div>
    </div>
  )
}

// ─── Root: TabMuaVe ──────────────────────────────────────────────────────────
// Luồng: 'search' → 'results' → 'passenger'
export default function TabMuaVe({ onAction }) {
  const [screen,     setScreen]     = useState('search')   // 'search' | 'results' | 'passenger'
  const [searchData, setSearchData] = useState(null)
  const [selFlight,  setSelFlight]  = useState(null)

  // Bước 1 → 2
  function handleSearch(data) {
    setSearchData(data)
    setScreen('results')
    onAction?.('🔍 Đang tìm chuyến bay...')
  }

  // Bước 2 → 3
  function handleSelectFlight(flight) {
    setSelFlight(flight)
    setScreen('passenger')
    onAction?.(`✅ Đã chọn ${flight.airline} ${flight.dep}→${flight.arr}`)
  }

  // Bước 3 hoàn tất
  function handleDone() {
    onAction?.('🎉 Đặt vé thành công! Vui lòng kiểm tra email.')
    // Sau 4 giây quay về trang tìm kiếm
    setTimeout(() => {
      setScreen('search')
      setSearchData(null)
      setSelFlight(null)
    }, 4000)
  }

  // ── Render theo screen ──
  if (screen === 'results') {
    return (
      <FlightResults
        searchData={searchData}
        onSelect={handleSelectFlight}
        onBack={() => {
          setScreen('search')
          onAction?.('↩ Quay lại tìm kiếm')
        }}
      />
    )
  }

  if (screen === 'passenger') {
    return (
      <PassengerForm
        flight={selFlight}
        searchData={searchData}
        onBack={() => {
          setScreen('results')
          onAction?.('↩ Quay lại danh sách chuyến bay')
        }}
        onDone={handleDone}
      />
    )
  }

  // Default: search
  return <SearchPanel onSearch={handleSearch} />
}