// src/components/tabs/TabThuTuc.jsx
// Luồng: 'form' → 'results'(FlightResults mode=checkin) → 'seats' → 'addons' → 'success'
import { useState } from 'react'
import FlightResults  from '../Flightresults'       // chỉnh path nếu FlightResults ở thư mục khác
import SeatSelector   from '../checkin/SeatSelector'
import AddonsService  from '../checkin/AddonsService'
import CheckinSuccess from '../checkin/CheckinSuccess'
import '../../styles/SearchPanel.css'

// ── Bước 1: Form nhập mã booking + tên ────────────────────────────────────────
function CheckinForm({ onSearch }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')

  function handleSubmit() {
    if (!code.trim() || !name.trim()) return
    onSearch(code.trim().toUpperCase(), name.trim().toUpperCase())
  }

  return (
    <div className="tab-content">
      <div className="form-row">
        <div className="form-field">
          <label className="form-field__label">🎫 Mã đặt chỗ</label>
          <input
            className="form-field__input"
            placeholder="VD: VB-4X9K2"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div className="form-field">
          <label className="form-field__label">👤 Họ và tên hành khách</label>
          <input
            className="form-field__input"
            placeholder="VD: NGUYEN VAN AN"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          style={{ opacity: code && name ? 1 : 0.45, cursor: code && name ? 'pointer' : 'not-allowed' }}
        >
          Tìm vé
        </button>
      </div>
      <p style={{ fontSize: 13, color: '#7ab0c0', marginTop: 8 }}>
        ⏰ Thủ tục trực tuyến mở trước 48 giờ và đóng 1 giờ trước giờ khởi hành
      </p>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function TabThuTuc({ onAction }) {
  const [screen,            setScreen]            = useState('form')
  const [searchData,        setSearchData]        = useState(null)
  const [selectedBookings,  setSelectedBookings]  = useState([])
  const [bookingsWithSeats, setBookingsWithSeats] = useState([])
  const [finalBookings,     setFinalBookings]     = useState([])

  // ── Form → FlightResults (checkin) ──
  function handleSearch(code, name) {
    setSearchData({
      bookingCode:   code,
      passengerName: name,
      from: '—', to: '—',
      passengers: '1',
    })
    setScreen('results')
    onAction?.('🔍 Đang tra cứu đặt chỗ...')
  }

  // ── FlightResults onSelect → nhận 1 flight object từ MOCK_BOOKED ──
  // Đảm bảo có field passengers để SeatSelector dùng
  function handleSelectFlight(flight) {
    const bookings = [{
      ...flight,
      passengers: flight.passengers ?? [{ name: 'HÀNH KHÁCH', seat: null, class: flight.class }],
    }]
    setSelectedBookings(bookings)
    setScreen('seats')
    onAction?.(`✅ ${flight.flightNo} — chọn ghế ngồi`)
  }

  // ── SeatSelector → AddonsService ──
  function handleSeatsConfirmed(bookings) {
    setBookingsWithSeats(bookings)
    setScreen('addons')
    onAction?.('💺 Ghế đã chọn — chọn dịch vụ bổ sung')
  }

  // ── AddonsService → CheckinSuccess ──
  function handleAddonsConfirmed({ bookings }) {
    setFinalBookings(bookings)
    setScreen('success')
    onAction?.('🎫 Thủ tục thành công! Vui lòng kiểm tra email.')
  }

  // ── Reset ──
  function handleReset() {
    setScreen('form')
    setSearchData(null)
    setSelectedBookings([])
    setBookingsWithSeats([])
    setFinalBookings([])
    onAction?.('↩ Quay về trang thủ tục')
  }

  switch (screen) {

    case 'results':
      return (
        <FlightResults
          mode="checkin"
          searchData={searchData}
          onSelect={handleSelectFlight}
          onBack={() => { setScreen('form'); onAction?.('↩ Quay lại') }}
        />
      )

    case 'seats':
      return (
        <SeatSelector
          bookings={selectedBookings}
          onNext={handleSeatsConfirmed}
          onBack={() => { setScreen('results'); onAction?.('↩ Quay lại kết quả') }}
        />
      )

    case 'addons':
      return (
        <AddonsService
          bookings={bookingsWithSeats}
          onNext={handleAddonsConfirmed}
          onBack={() => { setScreen('seats'); onAction?.('↩ Quay lại chọn ghế') }}
        />
      )

    case 'success':
      return (
        <CheckinSuccess
          bookings={finalBookings}
          onReset={handleReset}
        />
      )

    default: // 'form'
      return <CheckinForm onSearch={handleSearch} />
  }
}
