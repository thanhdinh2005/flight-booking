// src/components/tabs/TabMuaVe.jsx
// Kết nối: SearchPanel → FlightResults → PassengerForm → AddonsService
import { useState, useEffect, useCallback, useRef } from 'react'
import FlightResults from '../Flightresults'
import PassengerForm from '../Passengerform'
import AddonsService from '../checkin/AddonsService'
import PaymentSuccessModal from '../PaymentSuccessModal'
import DatePicker, { isBeforeIsoDate } from '../common/DatePicker'
import { searchFlights, searchAirports, formatFlight, filterFlights, sortFlights } from '../../services/flightAPI'
import { getToken, isTokenExpired } from '../../services/keycloakService'
import '../../styles/SearchPanel.css'

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api'

function getAuthHeaders() {
  const token = getToken()
  if (!token || isTokenExpired()) throw new Error('TOKEN_MISSING')
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function fmt(n) {
  return Number(n || 0).toLocaleString('vi-VN') + '₫'
}

function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '')
}

function fmtDate(raw) {
  if (!raw) return '—'
  const d = new Date(raw)
  return Number.isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function OrderSummaryStep({ booking, addonSelection, searchData, onBack, onPaid }) {
  const [paying, setPaying] = useState(false)
  const [vnpayUrl, setVnpayUrl] = useState(null)
  const [apiError, setApiError] = useState('')
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('')
  const [vnpayReturnPayload, setVnpayReturnPayload] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const paymentWindowRef = useRef(null)

  const addonTotal = addonSelection?.total || 0
  const addonRows = addonSelection?.summaryRows || []
  const grandTotal = Number(booking?.total_amount || 0) + Number(addonTotal || 0)

  useEffect(() => {
    function handleVnpayReturnMessage(event) {
      const message = event?.data
      if (!message || message.type !== 'VNPAY_RETURN') return

      setVnpayReturnPayload(message.payload || null)
    }

    window.addEventListener('message', handleVnpayReturnMessage)
    return () => window.removeEventListener('message', handleVnpayReturnMessage)
  }, [])

  async function handleVNPayRedirect() {
    if (!booking?.id) return
    setPaying(true)
    setApiError('')
    setPaymentStatusMessage('')
    setVnpayReturnPayload(null)

    const popup = window.open('', 'vnpay-payment', 'width=1200,height=800')
    paymentWindowRef.current = popup

    try {
      const res = await fetch(`${API_BASE}/payments/vnpay/${booking.id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || `Lỗi ${res.status}`)
      const url = json.data
      if (!url?.startsWith('http')) throw new Error('URL thanh toán không hợp lệ')
      setVnpayUrl(url)
      setPaymentStatusMessage('Hoàn tất thanh toán trên cửa sổ VNPay rồi bấm "Cập nhật trạng thái".')

      if (popup) {
        popup.location.href = url
        popup.focus()
      } else {
        window.open(url, '_blank')
      }

      onPaid?.()
    } catch (err) {
      if (popup && !popup.closed) popup.close()
      setApiError(
        err.message === 'TOKEN_MISSING'
          ? '🔐 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
          : err.message || 'Không lấy được link thanh toán. Vui lòng thử lại.'
      )
      setPaying(false)
    }
  }

  function handleReopenPayment() {
    if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
      paymentWindowRef.current.focus()
      return
    }

    if (vnpayUrl) {
      paymentWindowRef.current = window.open(vnpayUrl, 'vnpay-payment', 'width=1200,height=800')
    }
  }

  function handleRefreshPaymentStatus() {
    setCheckingStatus(true)
    setApiError('')
    setPaymentStatusMessage('')

    // Gọi API để kiểm tra trạng thái thanh toán
    const checkPaymentStatus = async () => {
      try {
        const token = getToken()
        if (!token || isTokenExpired()) {
          throw new Error('TOKEN_MISSING')
        }

        console.log('[Tabmuave] Checking booking status for PNR:', booking?.pnr)

        const res = await fetch(`${API_BASE}/booking?pnr=${booking?.pnr}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        console.log('[Tabmuave] Response status:', res.status)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const json = await res.json()
        console.log('[Tabmuave] Response data:', json)

        if (!json.success) {
          throw new Error(json.message || 'Không thể kiểm tra trạng thái')
        }

        const bookingData = json.data
        console.log('[Tabmuave] Booking status:', bookingData.status)

        if (bookingData.status === 'PAID') {
          // Thanh toán thành công
          setPaymentStatusMessage('✅ Thanh toán thành công!')
          setShowSuccessModal(true)
        } else {
          setPaymentStatusMessage('⏳ Thanh toán chưa được ghi nhận. Vui lòng đảm bảo thanh toán đã hoàn tất.')
        }
      } catch (err) {
        console.error('[Tabmuave] Error:', err)
        setApiError(
          err.message === 'TOKEN_MISSING'
            ? '🔐 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
            : `❌ ${err.message || 'Lỗi khi kiểm tra trạng thái'}`
        )
      } finally {
        setCheckingStatus(false)
      }
    }

    checkPaymentStatus()
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 40px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
        {['Thông tin', 'Dịch vụ', 'Thanh toán'].map((label, index) => {
          const state = index < 2 ? 'done' : 'active'
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: state === 'active' ? '#111827' : '#0f766e',
                  color: '#fff', fontWeight: 800, fontSize: 13,
                  boxShadow: state === 'active' ? '0 0 0 4px rgba(15,118,110,.18)' : 'none',
                }}>
                  {state === 'done' ? '✓' : index + 1}
                </div>
                <span style={{
                  marginTop: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '.6px', color: state === 'active' ? '#111827' : '#6b7280',
                }}>
                  {label}
                </span>
              </div>
              {index < 2 && (
                <div style={{ flex: 1, height: 2, background: '#0f766e', marginBottom: 18 }} />
              )}
            </div>
          )
        })}
      </div>

      <div style={{
        background: 'linear-gradient(135deg,#f0fdf9,#ecfeff)',
        border: '1px solid #99f6e4',
        borderRadius: 18,
        padding: '20px 22px',
        marginBottom: 18,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0f766e', marginBottom: 6 }}>
          Xác nhận đơn hàng
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
          Kiểm tra lại thông tin trước khi thanh toán
        </div>
        <div style={{ fontSize: 13, color: '#4b5563' }}>
          {searchData?.from} → {searchData?.to} · {fmtDate(searchData?.date)}
          {searchData?.tripType === 'round' && searchData?.retDate ? ` · Về ${fmtDate(searchData.retDate)}` : ''}
        </div>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: '18px 20px',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>🎟 Thông tin đặt chỗ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>PNR</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#065f46', fontFamily: 'Courier New, monospace' }}>{booking?.pnr || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>Liên hệ</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{booking?.contact_email || '—'}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{booking?.contact_phone || '—'}</div>
          </div>
        </div>
        {booking?.expires_at && (
          <div style={{ marginTop: 14, fontSize: 12, color: '#b45309' }}>
            ⏳ Hết hạn lúc <b>{new Date(booking.expires_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</b>
            {' '}ngày {new Date(booking.expires_at).toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: '18px 20px',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>👤 Hành khách & vé</div>
        {(booking?.tickets || []).map(ticket => (
          <div key={ticket.id} style={{ padding: '10px 0', borderBottom: '1px dashed #e5e7eb' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
              {ticket.passenger?.last_name} {ticket.passenger?.first_name}
              <span style={{ fontWeight: 500, color: '#6b7280' }}>
                {ticket.passenger?.gender === 'MALE' ? ' · Nam' : ticket.passenger?.gender === 'FEMALE' ? ' · Nữ' : ''}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>
              {ticket.flight_instance?.route?.origin?.code} → {ticket.flight_instance?.route?.destination?.code}
              {' · '}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 8px',
                borderRadius: 999,
                background: ticket.seat_class === 'BUSINESS' ? '#fffbeb' : '#eff6ff',
                color: ticket.seat_class === 'BUSINESS' ? '#92400e' : '#1d4ed8',
                fontSize: 11,
                fontWeight: 700,
              }}>
                {ticket.seat_class === 'BUSINESS' ? '👑 Thương gia' : '💺 Phổ thông'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#0f766e', fontWeight: 700, marginTop: 4 }}>
              {fmt(ticket.ticket_price)}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: '18px 20px',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>🛒 Dịch vụ bổ sung</div>
        {addonRows.length > 0 ? addonRows.map((row, index) => (
          <div key={`${row.label}-${row.name}-${index}`} style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 0',
            borderBottom: '1px dashed #e5e7eb',
            fontSize: 13,
          }}>
            <span style={{ color: '#374151' }}><b>{row.label}</b> · {row.name}</span>
            <span style={{ color: '#0f766e', fontWeight: 700 }}>{fmt(row.price)}</span>
          </div>
        )) : (
          <div style={{ fontSize: 13, color: '#6b7280' }}>Bạn chưa chọn dịch vụ bổ sung.</div>
        )}
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: '18px 20px',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>💰 Tổng thanh toán</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4b5563', marginBottom: 8 }}>
          <span>Tiền vé</span>
          <b style={{ color: '#111827' }}>{fmt(booking?.total_amount)}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4b5563', marginBottom: 8 }}>
          <span>Dịch vụ bổ sung</span>
          <b style={{ color: addonTotal > 0 ? '#0f766e' : '#111827' }}>{addonTotal > 0 ? `+${fmt(addonTotal)}` : fmt(0)}</b>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #e5e7eb',
          fontSize: 20,
          fontWeight: 800,
          color: '#111827',
        }}>
          <span>Tổng cộng</span>
          <span style={{ color: '#0f766e' }}>{fmt(grandTotal)}</span>
        </div>
      </div>

      {vnpayUrl && (
        <div style={{
          background: 'linear-gradient(135deg,#f0fdf9,#e6fffb)',
          border: '1px solid #99f6e4',
          borderRadius: 16,
          padding: '18px 20px',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#065f46', marginBottom: 6 }}>Đang chờ thanh toán...</div>
          <div style={{ fontSize: 13, color: '#047857', marginBottom: 14 }}>
            Trang thanh toán VNPay đã được mở trong tab mới.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handleReopenPayment}
              style={{
                background: '#0f766e', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Mở lại trang thanh toán →
            </button>
            <button
              onClick={handleRefreshPaymentStatus}
              disabled={checkingStatus}
              style={{
                background: checkingStatus ? '#ccfbf1' : '#ffffff',
                color: '#0f766e',
                border: '1px solid #0f766e',
                borderRadius: 10,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: checkingStatus ? 'not-allowed' : 'pointer',
              }}
            >
              {checkingStatus ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
            </button>
          </div>
          {paymentStatusMessage && (
            <div style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: '#0f766e' }}>
              {paymentStatusMessage}
            </div>
          )}
        </div>
      )}

      {apiError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          borderRadius: 10,
          padding: '12px 14px',
          fontSize: 13,
          marginBottom: 14,
        }}>
          {apiError}
        </div>
      )}

      {!vnpayUrl && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={onBack}
            style={{
              padding: '12px 18px',
              borderRadius: 10,
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#4b5563',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← Quay lại chọn dịch vụ
          </button>
          <button
            onClick={handleVNPayRedirect}
            disabled={paying}
            style={{
              flex: 1,
              minWidth: 240,
              padding: '14px 22px',
              borderRadius: 10,
              border: 'none',
              background: paying ? '#9ca3af' : 'linear-gradient(135deg,#0f766e,#115e59)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 800,
              cursor: paying ? 'not-allowed' : 'pointer',
            }}
          >
            {paying ? 'Đang chuyển sang thanh toán...' : `Tiếp tục thanh toán ${fmt(grandTotal)} →`}
          </button>
        </div>
      )}
      <PaymentSuccessModal 
        isOpen={showSuccessModal}
        onViewTickets={() => setShowSuccessModal(false)}
        onGoBack={() => setShowSuccessModal(false)}
      />
    </div>
  )
}

// ─── Airport Search ───────────────────────────────────────────────────────────
function AirportSearch({ label, value, onChange, placeholder, inputRef }) {
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
        } catch {
          // ignore
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="form-field" style={{ position: 'relative' }}>
      <label className="form-field__label">{label}</label>
      <div className="airport-search">
        <input
          ref={inputRef}
          className="form-field__input"
          placeholder={value || placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        {value && (
          <button
            className="clear-btn"
            onClick={() => onChange('')}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
          >✕</button>
        )}
      </div>
      {open && (suggestions.length > 0 || loading) && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
          <div className="suggestions-dropdown" style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
            background: 'white', border: '1px solid #ddd', borderRadius: 4,
            maxHeight: 200, overflowY: 'auto',
          }}>
            {loading && <div style={{ padding: 8 }}>⏳ Đang tìm...</div>}
            {suggestions.map((airport, i) => (
              <div
                key={i}
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                onClick={() => { onChange(airport); setQuery(''); setSuggestions([]); setOpen(false) }}
                onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                onMouseLeave={e => e.target.style.background = 'white'}
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

// ─── Search Panel ─────────────────────────────────────────────────────────────
const FALLBACK_AIRPORTS = [
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

function normalizeAirportLabel(airport) {
  if (!airport) return ''
  const code = airport.iata_code ?? airport.code ?? airport.id ?? ''
  const name = airport.name ?? airport.airport_name ?? ''
  const city = airport.city ?? airport.city_name ?? airport.location ?? ''
  if (!code && !name && !city) return ''

  const primary = name || city || code
  return `${primary}${code ? ` (${code})` : ''}${city && city !== primary ? ` – ${city}` : ''}`
}

function extractCode(airport) {
  const m = airport.match(/\(([A-Z]{3})\)/)
  return m ? m[1] : airport.split(' ')[0]
}

function SearchPanel({ onSearch, initialDestination, isLoading, airports, airportsLoading, airportsError }) {
  const [tripType,   setTripType]   = useState('one')
  const [fromCity,   setFromCity]   = useState(initialDestination?.from || 'Nội Bài (HAN) – Hà Nội')
  const [toCity,     setToCity]     = useState(initialDestination?.to || '')
  const [depDate,    setDepDate]    = useState('')
  const [retDate,    setRetDate]    = useState('')
  const [passengers, setPassengers] = useState('1')
  const [useLiveSearch, setUseLiveSearch] = useState(false)
  const panelRef = useRef(null)
  const fromInputRef = useRef(null)
  const toInputRef = useRef(null)

  useEffect(() => {
    if (!initialDestination) return
    setFromCity(initialDestination.from || 'Nội Bài (HAN) – Hà Nội')
    setToCity(initialDestination.to || '')
    window.requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const target = initialDestination.to ? toInputRef.current : fromInputRef.current
      target?.focus?.()
    })
  }, [initialDestination])

  function swap() {
    if (!toCity) return
    setFromCity(toCity)
    setToCity(fromCity)
  }

  useEffect(() => {
    if (tripType !== 'round' && retDate) setRetDate('')
  }, [tripType, retDate])

  function handleDepartureDateChange(value) {
    setDepDate(value)
    if (retDate && isBeforeIsoDate(retDate, value)) {
      setRetDate(value)
    }
  }

  function handleReturnDateChange(value) {
    if (depDate && isBeforeIsoDate(value, depDate)) {
      setRetDate(depDate)
      return
    }
    setRetDate(value)
  }

  function handleSearch() {
    if (!toCity)  { alert('⚠️ Vui lòng chọn điểm đến!'); return }
    if (!depDate) { alert('⚠️ Vui lòng chọn ngày đi!');  return }
    if (tripType === 'round' && retDate && isBeforeIsoDate(retDate, depDate)) {
      alert('⚠️ Ngày về không được bé hơn ngày đi!')
      return
    }
    onSearch({
      from:      extractCode(fromCity),
      to:        extractCode(toCity),
      fromLabel: fromCity,
      toLabel:   toCity,
      date:      depDate,
      retDate:   retDate,
      passengers,
      tripType,
    })
  }

  const isValid = toCity && depDate
  const airportOptions = airports.length > 0 ? airports : FALLBACK_AIRPORTS

  return (
    <div ref={panelRef} className="tab-content">
      <div className="radio-group">
        {[['one','Một chiều'],['round','Khứ hồi']].map(([v, l]) => (
          <label key={v} className="radio-label">
            <input type="radio" name="trip" value={v} checked={tripType === v} onChange={() => setTripType(v)} />
            {l}
          </label>
        ))}
      </div>


      <div className="form-row">
        {useLiveSearch ? (
          <AirportSearch label="✈️ Từ" value={fromCity} onChange={setFromCity} placeholder="Gõ tên thành phố..." inputRef={fromInputRef} />
        ) : (
          <div className="form-field">
            <label className="form-field__label">✈️ Từ</label>
            <select ref={fromInputRef} className="form-field__input" value={fromCity} onChange={e => setFromCity(e.target.value)} disabled={airportsLoading}>
              {airportOptions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        <button className="swap-btn" onClick={swap} title="Đổi chiều">⇄</button>

        {useLiveSearch ? (
          <AirportSearch label="🛬 Đến" value={toCity} onChange={setToCity} placeholder="Gõ tên thành phố..." inputRef={toInputRef} />
        ) : (
          <div className="form-field">
            <label className="form-field__label">🛬 Đến</label>
            <select ref={toInputRef} className="form-field__input" value={toCity} onChange={e => setToCity(e.target.value)} disabled={airportsLoading}>
              <option value="">-- Chọn điểm đến --</option>
              {airportOptions.filter(a => a !== fromCity).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}
      </div>

      {airportsError && (
        <div style={{ color: '#dc2626', fontSize: 12, marginTop: -4, marginBottom: 12 }}>
          {airportsError}
        </div>
      )}

      <div className="form-row">
        <DatePicker label="📅 Ngày đi" value={depDate} onChange={handleDepartureDateChange} theme="light" className="form-field" />
        {tripType === 'round' && (
          <DatePicker label="📅 Ngày về" value={retDate} onChange={handleReturnDateChange} minDate={depDate || undefined} theme="light" className="form-field" />
        )}
        <div className="form-field">
          <label className="form-field__label">👥 Hành khách</label>
          <select className="form-field__select" value={passengers} onChange={e => setPassengers(e.target.value)}>
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

// ─── Flight Filters ───────────────────────────────────────────────────────────
function FlightFilters({ filters, onFilterChange, onSortChange, sortBy, sortOrder, resultCount }) {
  const [localFilters, setLocalFilters] = useState(filters || {})
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        
       
      </div>

      {showFilters && (
        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginTop: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>💰 Khoảng giá (VNĐ)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" placeholder="Từ" value={localFilters.minPrice || ''}
                  onChange={e => setLocalFilters({...localFilters, minPrice: e.target.value ? parseInt(digitsOnly(e.target.value)) : undefined})}
                  onKeyDown={e => {
                    const allowKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
                    if (e.ctrlKey || e.metaKey || allowKeys.includes(e.key)) return
                    if (!/^\d$/.test(e.key) && e.key.length === 1) e.preventDefault()
                  }}
                  inputMode="numeric"
                  style={{ width: '45%', padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} />
                <span style={{ color: '#999' }}>-</span>
                <input type="text" placeholder="Đến" value={localFilters.maxPrice || ''}
                  onChange={e => setLocalFilters({...localFilters, maxPrice: e.target.value ? parseInt(digitsOnly(e.target.value)) : undefined})}
                  onKeyDown={e => {
                    const allowKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
                    if (e.ctrlKey || e.metaKey || allowKeys.includes(e.key)) return
                    if (!/^\d$/.test(e.key) && e.key.length === 1) e.preventDefault()
                  }}
                  inputMode="numeric"
                  style={{ width: '45%', padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>🕐 Giờ khởi hành</label>
              <select value={localFilters.timeRange || ''}
                onChange={e => setLocalFilters({...localFilters, timeRange: e.target.value || undefined})}
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}>
                <option value="">Tất cả</option>
                <option value="0-6">Sáng sớm (00:00 - 06:00)</option>
                <option value="6-12">Buổi sáng (06:00 - 12:00)</option>
                <option value="12-18">Buổi chiều (12:00 - 18:00)</option>
                <option value="18-24">Buổi tối (18:00 - 24:00)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>📊 Sắp xếp theo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={sortBy} onChange={e => onSortChange(e.target.value, sortOrder)}
                  style={{ flex: 1, padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}>
                  <option value="price">Giá vé</option>
                  <option value="duration">Thời gian bay</option>
                  <option value="departure">Giờ khởi hành</option>
                  <option value="arrival">Giờ hạ cánh</option>
                </select>
                <button onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                  style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => { setLocalFilters({}); onFilterChange({}) }}
              style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 13 }}>
              Đặt lại
            </button>
            <button onClick={() => onFilterChange(localFilters)}
              style={{ padding: '8px 16px', border: 'none', borderRadius: 4, background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: 13 }}>
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Root: TabMuaVe ───────────────────────────────────────────────────────────
// Luồng: 'search' → 'results' → 'passenger' → 'addons' → 'summary'
export default function TabMuaVe({ onAction, initialDestination }) {

  const [screen,    setScreen]    = useState('search')   // 'search' | 'outbound' | 'return' | 'passenger' | 'addons' | 'summary'
  const [searchData, setSearchData] = useState(null)
  const [outboundSel, setOutboundSel] = useState(null)
  const [returnSel, setReturnSel] = useState(null)
  const [booking, setBooking] = useState(null)
  const [addonSelection, setAddonSelection] = useState({ total: 0, selected: {}, summaryRows: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [apiResults, setApiResults] = useState(null)
  const [filters,   setFilters]   = useState({})
  const [sortBy,    setSortBy]    = useState('price')
  const [sortOrder, setSortOrder] = useState('asc')
  const [error,     setError]     = useState(null)
  const [airports, setAirports] = useState(FALLBACK_AIRPORTS)
  const [airportsLoading, setAirportsLoading] = useState(false)
  const [airportsError, setAirportsError] = useState('')

  const fetchAirports = useCallback(async () => {
    setAirportsLoading(true)
    setAirportsError('')
    try {
      const res = await fetch(`${API_BASE}/airports`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const rawAirports = Array.isArray(data) ? data : (data.data ?? [])
      const normalizedAirports = rawAirports
        .map(normalizeAirportLabel)
        .filter(Boolean)

      if (normalizedAirports.length > 0) {
        setAirports(normalizedAirports)
      }
    } catch (err) {
      setAirportsError('Không tải được danh sách sân bay, đang dùng dữ liệu mặc định.')
    } finally {
      setAirportsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAirports()
  }, [fetchAirports])

  useEffect(() => {
    if (!initialDestination) return
    setScreen('search')
    setError(null)
    setSearchData(null)
    setOutboundSel(null)
    setReturnSel(null)
    setBooking(null)
    setApiResults(null)
    setFilters({})
    setAddonSelection({ total: 0, selected: {}, summaryRows: [] })
  }, [initialDestination])

  // Bước 1 → 2: tìm kiếm
  async function handleSearch(data) {
    setIsLoading(true)
    setError(null)
    setSearchData(data)
    setOutboundSel(null)
    setReturnSel(null)
    setBooking(null)
    setAddonSelection({ total: 0, selected: {}, summaryRows: [] })
    try {
      const result = await searchFlights({
        origin:         data.from,
        destination:    data.to,
        departure_date: data.date,
        return_date:    data.retDate || undefined,
        adults:         parseInt(data.passengers) || 1,
      })
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
    } catch (err) {
      setError(err.message || 'Lỗi tìm kiếm chuyến bay')
      onAction?.('❌ ' + (err.message || 'Lỗi tìm kiếm'))
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredFlights = () => {
    if (!apiResults) return { outbound: [], return: [] }
    const filterConfig = {
      ...filters,
      depTimeRange: filters.timeRange ? filters.timeRange.split('-').map(Number) : undefined,
    }
    return {
      outbound: sortFlights(filterFlights(apiResults.outbound, filterConfig), sortBy, sortOrder),
      return:   sortFlights(filterFlights(apiResults.return,   filterConfig), sortBy, sortOrder),
    }
  }

  // ── Bước 2 → 3: FlightResults gọi callback này sau khi user chọn hạng vé ──
  // flight đã chứa { seat_class: "ECONOMY" | "BUSINESS", class: "Phổ thông" | "Thương gia", price, ... }
  const handleSelectFlight = useCallback((flight) => {
    const seatLabel = flight.class || flight.seat_class || ''

    if (searchData?.tripType === 'round') {
      if (screen === 'return') {
        setReturnSel(flight)
        setScreen('passenger')
        onAction?.(`✅ Đã chọn lượt về ${flight.airline} ${flight.dep}→${flight.arr} · ${seatLabel}`)
        return
      }

      setOutboundSel(flight)
      setScreen('return')
      onAction?.(`✅ Đã chọn lượt đi ${flight.airline} ${flight.dep}→${flight.arr} · ${seatLabel}. Mời chọn chuyến về.`)
      return
    }

    setOutboundSel(flight)
    setScreen('passenger')
    onAction?.(`✅ Đã chọn ${flight.airline} ${flight.dep}→${flight.arr} · ${seatLabel}`)
  }, [onAction, screen, searchData?.tripType])

  // Bước 3 (PassengerForm) → bước 4 (AddonsService)
  // PassengerForm nên gọi onDone({ ticket_id }) để truyền ticket_id
  function handlePassengerDone(result) {
    setBooking(result?.booking ?? null)
    setAddonSelection({ total: 0, selected: {}, summaryRows: [] })
    setScreen('addons')
    onAction?.('🎫 Đã điền thông tin hành khách — chọn dịch vụ bổ sung')
  }

  // Bước 4 → 5: tổng hợp trước khi thanh toán
  function handleAddonsDone(result) {
    setAddonSelection({
      total: result?.total || 0,
      selected: result?.selected || {},
      summaryRows: result?.summaryRows || [],
    })
    setScreen('summary')
    onAction?.('🧾 Đã cập nhật dịch vụ bổ sung — kiểm tra đơn hàng trước khi thanh toán')
  }

  function handlePaymentStart() {
    onAction?.('💳 Đang mở trang thanh toán VNPay')
  }

  // ── Render ──
  if (screen === 'results' || screen === 'return') {
    const filteredFlights = getFilteredFlights()
    const choosingReturn = searchData?.tripType === 'round' && outboundSel
    const activeFlights = choosingReturn ? filteredFlights.return : filteredFlights.outbound
    const activeSearchData = choosingReturn
      ? {
          ...searchData,
          from: searchData?.to,
          to: searchData?.from,
          fromLabel: searchData?.toLabel,
          toLabel: searchData?.fromLabel,
          date: searchData?.retDate || searchData?.date,
          tripType: 'one',
        }
      : searchData

    return (
      <div>
        {choosingReturn && (
          <div style={{ padding: 12, background: '#eff6ff', color: '#1d4ed8', borderRadius: 4, marginBottom: 16 }}>
            Đã chọn lượt đi {outboundSel?.depCode} → {outboundSel?.arrCode}. Hãy chọn chuyến bay về và hạng ghế.
          </div>
        )}
        <FlightFilters
          filters={filters}
          onFilterChange={setFilters}
          onSortChange={(by, order) => { setSortBy(by); setSortOrder(order) }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          resultCount={activeFlights.length}
        />
        {error && (
          <div style={{ padding: 12, background: '#fef2f2', color: '#dc2626', borderRadius: 4, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}
        {/*
          FlightResults sẽ:
          1. Hiện 2 giá (Economy / Business) trên mỗi card
          2. Khi click card hoặc "Chọn chỗ" → mở SeatClassPanel
          3. Sau khi user chọn hạng → gọi onSelect(flight) với flight.seat_class đã có
        */}
        <FlightResults
          searchData={activeSearchData}
          flights={{ outbound: activeFlights }}
          isLoading={isLoading}
          onSelect={handleSelectFlight}
          navigateOnSelect={false}
          onBack={() => {
            if (choosingReturn) {
              setOutboundSel(null)
              setScreen('results')
              onAction?.('↩ Quay lại chọn chuyến đi')
              return
            }

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
    const selectedFlights = [outboundSel, returnSel].filter(Boolean)
    return (
      <PassengerForm
        flight={outboundSel}
        selectedFlights={selectedFlights}
        searchData={searchData}
        onBack={() => {
          if (searchData?.tripType === 'round' && returnSel) {
            setScreen('return')
            onAction?.('↩ Quay lại chọn chuyến về')
            return
          }

          setScreen('results')
          onAction?.('↩ Quay lại danh sách chuyến bay')
        }}
        onDone={handlePassengerDone}
      />
    )
  }

  if (screen === 'addons') {
    const bookings = (booking?.tickets || []).map((ticket, index) => ({
      id:      ticket.id,
      depCode: ticket.flight_instance?.route?.origin?.code      || (index === 0 ? searchData?.from : searchData?.to),
      arrCode: ticket.flight_instance?.route?.destination?.code || (index === 0 ? searchData?.to : searchData?.from),
      date:    ticket.flight_instance?.std?.slice(0, 10) || (index === 0 ? searchData?.date : searchData?.retDate) || '',
    }))

    if (bookings.length === 0) {
      ;[outboundSel, returnSel].filter(Boolean).forEach((item, index) => {
        bookings.push({
          id:      item.id ?? index + 1,
          depCode: item.depCode ?? (index === 0 ? searchData?.from : searchData?.to),
          arrCode: item.arrCode ?? (index === 0 ? searchData?.to : searchData?.from),
          date:    index === 0 ? searchData?.date ?? '' : searchData?.retDate ?? '',
        })
      })
    }

    return (
      <AddonsService
        bookings={bookings}
        onBack={() => {
          setScreen('passenger')
          onAction?.('↩ Quay lại thông tin hành khách')
        }}
        onNext={handleAddonsDone}
      />
    )
  }

  if (screen === 'summary') {
    return (
      <OrderSummaryStep
        booking={booking}
        addonSelection={addonSelection}
        searchData={searchData}
        onBack={() => {
          setScreen('addons')
          onAction?.('↩ Quay lại chọn dịch vụ bổ sung')
        }}
        onPaid={handlePaymentStart}
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
        airports={airports}
        airportsLoading={airportsLoading}
        airportsError={airportsError}
      />
      {error && (
        <div style={{ padding: 12, background: '#fef2f2', color: '#dc2626', borderRadius: 4, marginTop: 16 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
