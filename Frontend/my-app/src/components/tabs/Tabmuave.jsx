// src/components/tabs/TabMuaVe.jsx
// Kết nối: SearchPanel → FlightResults → PassengerForm (+ RefundPolicyModal)
import { useState, useEffect, useCallback } from 'react'
import FlightResults from '../Flightresults'
import PassengerForm from '../Passengerform'
import { searchFlights, searchAirports, formatFlight, filterFlights, sortFlights } from '../../services/flightAPI'
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

// ─── Airport Search Component with API ──────────────────────────────────────
function AirportSearch({ label, value, onChange, placeholder }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 1) {
        setLoading(true)
        try {
          const results = await searchAirports(query)
          setSuggestions(results.map(a => `${a.display_name} - ${a.city}`))
        } catch (err) {
          console.error('Airport search failed:', err)
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (airport) => {
    onChange(airport)
    setQuery('')
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div className="form-field" style={{ position: 'relative' }}>
      <label className="form-field__label">{label}</label>
      <div className="airport-search">
        <input
          className="form-field__input"
          placeholder={value || placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
        />
        {value && (
          <button 
            className="clear-btn" 
            onClick={() => onChange('')}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
          >
            ✕
          </button>
        )}
      </div>
      {open && (suggestions.length > 0 || loading) && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
          <div className="suggestions-dropdown" style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            zIndex: 200,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: 4,
            maxHeight: 200,
            overflowY: 'auto'
          }}>
            {loading && <div style={{ padding: 8 }}>⏳ Đang tìm...</div>}
            {suggestions.map((airport, i) => (
              <div
                key={i}
                className="suggestion-item"
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                onClick={() => handleSelect(airport)}
                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                {airport}
              </div>
            ))}
          </div>
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

function SearchPanel({ onSearch, initialDestination, isLoading }) {
  const [tripType,   setTripType]   = useState('one')
  const [fromCity,   setFromCity]   = useState(initialDestination?.from || 'Nội Bài (HAN) – Hà Nội')
  const [toCity,     setToCity]     = useState(initialDestination?.to || '')
  const [depDate,    setDepDate]    = useState('')
  const [retDate,    setRetDate]    = useState('')
  const [passengers, setPassengers] = useState('1')
  const [useLiveSearch, setUseLiveSearch] = useState(false)

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

      {/* Toggle live search */}
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
          <input
            type="checkbox"
            checked={useLiveSearch}
            onChange={(e) => setUseLiveSearch(e.target.checked)}
          />
          🔍 Tìm kiếm sân bay trực tiếp (gõ để tìm)
        </label>
      </div>

      {/* From / To */}
      <div className="form-row">
        {useLiveSearch ? (
          <AirportSearch
            label="✈️ Từ"
            value={fromCity}
            onChange={setFromCity}
            placeholder="Gõ tên thành phố hoặc mã sân bay..."
          />
        ) : (
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
        )}

        <button className="swap-btn" onClick={swap} title="Đổi chiều">⇄</button>

        {useLiveSearch ? (
          <AirportSearch
            label="🛬 Đến"
            value={toCity}
            onChange={setToCity}
            placeholder="Gõ tên thành phố hoặc mã sân bay..."
          />
        ) : (
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
        )}
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
          disabled={!isValid || isLoading}
          style={{ opacity: isValid && !isLoading ? 1 : 0.45, cursor: isValid && !isLoading ? 'pointer' : 'not-allowed' }}
        >
          {isLoading ? '⏳ Đang tìm...' : 'Tìm chuyến bay'}
        </button>
      </div>
    </div>
  )
}

// ─── Flight Filters Component ────────────────────────────────────────────────
function FlightFilters({ filters, onFilterChange, onSortChange, sortBy, sortOrder, resultCount }) {
  const [localFilters, setLocalFilters] = useState(filters || {})
  const [showFilters, setShowFilters] = useState(false)

  const handleApply = () => {
    onFilterChange(localFilters)
  }

  const handleReset = () => {
    setLocalFilters({})
    onFilterChange({})
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{ 
            padding: '8px 16px', 
            border: '1px solid #ddd', 
            borderRadius: 4, 
            background: showFilters ? '#e0e7ff' : 'white',
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          🔍 Bộ lọc {showFilters ? '▲' : '▼'}
        </button>
        
        <span style={{ fontSize: 14, color: '#666' }}>
          {resultCount} chuyến bay
        </span>
      </div>

      {showFilters && (
        <div style={{ 
          padding: 16, 
          background: '#f8fafc', 
          borderRadius: 8, 
          marginTop: 12,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {/* Price Range */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                💰 Khoảng giá (VNĐ)
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Từ"
                  value={localFilters.minPrice || ''}
                  onChange={(e) => setLocalFilters({...localFilters, minPrice: e.target.value ? parseInt(e.target.value) : undefined})}
                  style={{ width: '45%', padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                />
                <span style={{ color: '#999' }}>-</span>
                <input
                  type="number"
                  placeholder="Đến"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) => setLocalFilters({...localFilters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined})}
                  style={{ width: '45%', padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                />
              </div>
            </div>

            {/* Departure Time */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                🕐 Giờ khởi hành
              </label>
              <select
                value={localFilters.timeRange || ''}
                onChange={(e) => setLocalFilters({...localFilters, timeRange: e.target.value || undefined})}
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
              >
                <option value="">Tất cả</option>
                <option value="0-6">Sáng sớm (00:00 - 06:00)</option>
                <option value="6-12">Buổi sáng (06:00 - 12:00)</option>
                <option value="12-18">Buổi chiều (12:00 - 18:00)</option>
                <option value="18-24">Buổi tối (18:00 - 24:00)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                📊 Sắp xếp theo
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value, sortOrder)}
                  style={{ flex: 1, padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                >
                  <option value="price">Giá vé</option>
                  <option value="duration">Thời gian bay</option>
                  <option value="departure">Giờ khởi hành</option>
                  <option value="arrival">Giờ hạ cánh</option>
                </select>
                <button
                  onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                  style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={handleReset}
              style={{ 
                padding: '8px 16px', 
                border: '1px solid #ddd', 
                borderRadius: 4, 
                background: 'white',
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Đặt lại
            </button>
            <button
              onClick={handleApply}
              style={{ 
                padding: '8px 16px', 
                border: 'none', 
                borderRadius: 4, 
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Root: TabMuaVe ──────────────────────────────────────────────────────────
// Luồng: 'search' → 'results' → 'passenger'
export default function TabMuaVe({ onAction, initialDestination }) {
  const [screen,     setScreen]     = useState('search')   // 'search' | 'results' | 'passenger'
  const [searchData, setSearchData] = useState(null)
  const [selFlight,  setSelFlight]  = useState(null)
  const [isLoading,  setIsLoading]  = useState(false)
  const [apiResults, setApiResults] = useState(null)
  const [filters,    setFilters]    = useState({})
  const [sortBy,     setSortBy]     = useState('price')
  const [sortOrder,  setSortOrder]  = useState('asc')
  const [error,      setError]      = useState(null)

  // Bước 1 → 2: Call API
  async function handleSearch(data) {
    setIsLoading(true)
    setError(null)
    setSearchData(data)
    
    try {
      const result = await searchFlights({
        origin: data.from,
        destination: data.to,
        departure_date: data.date,
        return_date: data.retDate || undefined,
        adults: parseInt(data.passengers) || 1,
      })
      
      // Format flights from API
      const formattedResults = {
        outbound: result.data?.outbound?.flatMap(day => 
          day.flights.map(f => formatFlight(f))
        ) || [],
        return: result.data?.return?.flatMap(day => 
          day.flights.map(f => formatFlight(f))
        ) || [],
      }
      
      setApiResults(formattedResults)
      setScreen('results')
      onAction?.(`🔍 Tìm thấy ${formattedResults.outbound.length} chuyến bay`)
    } catch (err) {
      setError(err.message || 'Lỗi tìm kiếm chuyến bay')
      onAction?.('❌ ' + (err.message || 'Lỗi tìm kiếm'))
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters and sorting
  const getFilteredFlights = () => {
    if (!apiResults) return { outbound: [], return: [] }
    
    const filterConfig = {
      ...filters,
      depTimeRange: filters.timeRange 
        ? filters.timeRange.split('-').map(Number) 
        : undefined,
    }
    
    return {
      outbound: sortFlights(
        filterFlights(apiResults.outbound, filterConfig),
        sortBy,
        sortOrder
      ),
      return: sortFlights(
        filterFlights(apiResults.return, filterConfig),
        sortBy,
        sortOrder
      ),
    }
  }

  // Bước 2 → 3: chuyển sang màn hình nhập thông tin hành khách
  const handleSelectFlight = useCallback((flight) => {
    setSelFlight(flight)
    setScreen('passenger')
    const dep = flight.dep || flight.dep_time || ''
    const arr = flight.arr || flight.arr_time || ''
    onAction?.(`✅ Đã chọn ${flight.airline} ${dep}→${arr}`)
  }, [onAction])

  // Bước 3 hoàn tất
  function handleDone() {
    onAction?.('🎉 Đặt vé thành công! Vui lòng kiểm tra email.')
    setTimeout(() => {
      setScreen('search')
      setSearchData(null)
      setSelFlight(null)
      setApiResults(null)
      setFilters({})
    }, 4000)
  }

  // ── Render theo screen ──
  if (screen === 'results') {
    const filteredFlights = getFilteredFlights()
    
    return (
      <div>
        <FlightFilters
          filters={filters}
          onFilterChange={setFilters}
          onSortChange={(by, order) => { setSortBy(by); setSortOrder(order); }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          resultCount={filteredFlights.outbound.length}
        />
        
        {error && (
          <div style={{ 
            padding: 12, 
            background: '#fef2f2', 
            color: '#dc2626',
            borderRadius: 4,
            marginBottom: 16 
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <FlightResults
          searchData={searchData}
          flights={filteredFlights}
          isLoading={isLoading}
          onSelect={(flight) => handleSelectFlight(flight)}
          onBack={() => {
            setScreen('search')
            setError(null)
            setFilters({})
            setApiResults(null)
            onAction?.('↩ Quay lại tìm kiếm')
          }}
        />
      </div>
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
  return (
    <div>
      <SearchPanel 
        onSearch={handleSearch} 
        initialDestination={initialDestination}
        isLoading={isLoading}
      />
      {error && (
        <div style={{ 
          padding: 12, 
          background: '#fef2f2', 
          color: '#dc2626',
          borderRadius: 4,
          marginTop: 16 
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}