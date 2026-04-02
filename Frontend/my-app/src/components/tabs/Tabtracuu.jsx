import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from '../common/DatePicker'

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api'

const css = `
  .ttc-root {
    --ttc-teal: #2ab5b5;
    --ttc-teal-dark: #178f91;
    --ttc-ink: #16313b;
    --ttc-muted: #6f93a0;
    --ttc-border: #d7ecef;
    --ttc-card: #ffffff;
    --ttc-soft: #f4fbfc;
    --ttc-soft-2: #ebf8fa;
    --ttc-danger: #d54c4c;
    --ttc-shadow: 0 18px 40px rgba(27, 118, 126, 0.10);
    color: var(--ttc-ink);
  }

  .ttc-top {
    display: grid;
    gap: 16px;
  }

  .ttc-error {
    border: 1px solid rgba(213, 76, 76, 0.2);
    background: rgba(213, 76, 76, 0.08);
    color: var(--ttc-danger);
    padding: 12px 14px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 600;
  }

  .ttc-summary {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding: 18px 20px;
    border: 1px solid var(--ttc-border);
    border-radius: 20px;
    background: linear-gradient(180deg, #ffffff, #f7fcfd);
    box-shadow: var(--ttc-shadow);
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .ttc-summary__title {
    font-size: 28px;
    font-weight: 800;
    line-height: 1.05;
    margin-bottom: 6px;
  }

  .ttc-summary__sub {
    font-size: 14px;
    color: var(--ttc-muted);
  }

  .ttc-route-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(42, 181, 181, 0.18);
    background: rgba(42, 181, 181, 0.08);
    color: var(--ttc-teal-dark);
    font-size: 13px;
    font-weight: 700;
  }

  .ttc-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin: 18px 0 12px;
    flex-wrap: wrap;
  }

  .ttc-toolbar__left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ttc-toolbar__label {
    color: var(--ttc-muted);
    font-size: 13px;
    font-weight: 700;
  }

  .ttc-sort-btn {
    border: 1px solid var(--ttc-border);
    background: #fff;
    color: var(--ttc-muted);
    border-radius: 999px;
    padding: 9px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
  }

  .ttc-sort-btn:hover,
  .ttc-sort-btn--active {
    color: var(--ttc-teal-dark);
    border-color: rgba(42, 181, 181, 0.32);
    background: rgba(42, 181, 181, 0.08);
  }

  .ttc-count {
    color: var(--ttc-muted);
    font-size: 13px;
    font-weight: 700;
  }

  .ttc-list {
    display: grid;
    gap: 16px;
  }

  .ttc-card {
    border: 1px solid var(--ttc-border);
    border-radius: 24px;
    background: linear-gradient(180deg, #ffffff, #f8fcfd);
    box-shadow: var(--ttc-shadow);
    overflow: hidden;
  }

  .ttc-card__main {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(220px, .9fr);
  }

  .ttc-card__flight {
    padding: 22px 22px 18px;
  }

  /* Flight Header */
  .ttc-flight-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;
  }

  .ttc-flight-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .ttc-flight-no-large {
    font-size: 20px;
    font-weight: 800;
    color: var(--ttc-ink);
  }

  .ttc-status-badge {
    display: inline-flex;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(42, 181, 181, 0.12);
    color: var(--ttc-teal-dark);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  /* Time Display */
  .ttc-time-display {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: linear-gradient(180deg, rgba(42, 181, 181, 0.04), rgba(23, 143, 145, 0.02));
    border: 1px solid rgba(42, 181, 181, 0.12);
    border-radius: 14px;
    margin-bottom: 14px;
  }

  .ttc-time-section {
    display: grid;
    gap: 6px;
    text-align: center;
    align-items: center;
  }

  .ttc-time-value {
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    color: var(--ttc-ink);
  }

  .ttc-time-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--ttc-teal-dark);
    text-transform: uppercase;
  }

  .ttc-time-middle {
    display: grid;
    gap: 8px;
    justify-items: center;
  }

  .ttc-duration-badge {
    font-size: 12px;
    font-weight: 800;
    color: var(--ttc-muted);
    background: rgba(42, 181, 181, 0.08);
    padding: 4px 10px;
    border-radius: 8px;
  }

  .ttc-line {
    width: 100%;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(42, 181, 181, 0.1), rgba(42, 181, 181, 0.55), rgba(42, 181, 181, 0.1));
    position: relative;
  }

  .ttc-line::after {
    content: '✈';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-58%);
    font-size: 12px;
    color: var(--ttc-teal-dark);
  }

  .ttc-direct-badge {
    font-size: 10px;
    font-weight: 800;
    color: var(--ttc-muted);
    letter-spacing: 0.6px;
    text-transform: uppercase;
  }

  /* Details Info */
  .ttc-details-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 14px;
  }

  .ttc-detail-item {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    background: var(--ttc-soft);
    border: 1px solid var(--ttc-border);
    border-radius: 12px;
  }

  .ttc-detail-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--ttc-muted);
    line-height: 1.2;
  }

  .ttc-detail-value {
    font-size: 13px;
    font-weight: 800;
    color: var(--ttc-ink);
  }

  .ttc-card__side {
    background: linear-gradient(180deg, #f2fbfc, #ecf8fa);
    border-left: 1px solid var(--ttc-border);
    padding: 22px 20px;
    display: grid;
    align-content: space-between;
    gap: 18px;
  }

  .ttc-side__top {
    display: grid;
    gap: 10px;
  }

  .ttc-date {
    font-size: 15px;
    font-weight: 800;
    color: var(--ttc-ink);
  }

  .ttc-date-sub {
    font-size: 12px;
    color: var(--ttc-muted);
  }

  .ttc-flight-no {
    font-size: 13px;
    font-weight: 800;
    color: var(--ttc-teal-dark);
  }

  .ttc-cta {
    display: grid;
    gap: 10px;
  }

  .ttc-btn {
    border: none;
    border-radius: 14px;
    padding: 13px 16px;
    font: inherit;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
  }

  .ttc-btn:hover {
    transform: translateY(-1px);
  }

  .ttc-btn--primary {
    color: #fff;
    background: linear-gradient(135deg, var(--ttc-teal), var(--ttc-teal-dark));
    box-shadow: 0 14px 28px rgba(23, 143, 145, 0.24);
  }

  .ttc-btn--ghost {
    color: var(--ttc-teal-dark);
    background: #fff;
    border: 1px solid rgba(42, 181, 181, 0.24);
  }

  .ttc-empty,
  .ttc-loading {
    margin-top: 20px;
    border: 1px solid var(--ttc-border);
    border-radius: 20px;
    background: linear-gradient(180deg, #ffffff, #f8fcfd);
    padding: 28px 22px;
    text-align: center;
    color: var(--ttc-muted);
    font-size: 14px;
    font-weight: 700;
  }

  .ttc-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 28, 33, 0.42);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .ttc-modal {
    width: min(760px, 100%);
    background: #fff;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 28px 80px rgba(13, 39, 44, 0.22);
  }

  .ttc-modal__hero {
    padding: 22px 24px;
    background: linear-gradient(135deg, #16313b, #1d6f76);
    color: #fff;
  }

  .ttc-modal__eyebrow {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
    opacity: .75;
    margin-bottom: 8px;
  }

  .ttc-modal__title {
    font-size: 28px;
    font-weight: 800;
    line-height: 1.05;
  }

  .ttc-modal__sub {
    margin-top: 8px;
    font-size: 13px;
    opacity: .82;
  }

  .ttc-modal__body {
    padding: 22px 24px 24px;
    display: grid;
    gap: 18px;
  }

  .ttc-modal__timeline {
    display: grid;
    grid-template-columns: minmax(110px, auto) minmax(140px, 1fr) minmax(110px, auto);
    gap: 16px;
    align-items: center;
    padding: 18px;
    border: 1px solid var(--ttc-border);
    border-radius: 20px;
    background: linear-gradient(180deg, #f9fdfd, #f1fafb);
  }

  .ttc-modal__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .ttc-modal__kv {
    border: 1px solid var(--ttc-border);
    border-radius: 16px;
    background: var(--ttc-soft);
    padding: 14px;
  }

  .ttc-modal__kv-label {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--ttc-muted);
    margin-bottom: 6px;
  }

  .ttc-modal__kv-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--ttc-ink);
    line-height: 1.4;
  }

  .ttc-modal__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  /* Modal Pricing Styles */
  .ttc-modal__pricing {
    background: linear-gradient(135deg, rgba(42, 181, 181, 0.06), rgba(23, 143, 145, 0.03));
    border: 1px solid rgba(42, 181, 181, 0.15);
    border-radius: 14px;
    padding: 16px;
    margin-top: 16px;
  }

  .ttc-modal__pricing-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--ttc-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  .ttc-modal__pricing-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .ttc-modal__price-item {
    background: #ffffff;
    border: 1px solid rgba(42, 181, 181, 0.2);
    border-radius: 10px;
    padding: 12px;
    text-align: center;
  }

  .ttc-modal__price-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--ttc-ink);
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .ttc-modal__price-value {
    font-size: 16px;
    font-weight: 800;
    color: var(--ttc-teal-dark);
    margin-bottom: 6px;
  }

  .ttc-modal__seats {
    font-size: 11px;
    color: var(--ttc-muted);
    font-weight: 600;
  }

  .ttc-search-box {
    position: relative;
  }

  .ttc-search-box__menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 40;
    border: 1px solid var(--ttc-border);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 18px 34px rgba(22, 67, 74, 0.14);
    max-height: 240px;
    overflow-y: auto;
  }

  .ttc-search-box__item {
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    padding: 12px 14px;
    cursor: pointer;
    display: grid;
    gap: 3px;
  }

  .ttc-search-box__item:hover {
    background: var(--ttc-soft);
  }

  .ttc-search-box__main {
    font-size: 13px;
    font-weight: 700;
    color: var(--ttc-ink);
  }

  .ttc-search-box__sub {
    font-size: 12px;
    color: var(--ttc-muted);
  }

  .ttc-search-box__empty {
    padding: 12px 14px;
    font-size: 12px;
    color: var(--ttc-muted);
  }

  /* Pricing Section */
  .ttc-pricing {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--ttc-border);
  }

  .ttc-pricing__title {
    font-size: 12px;
    font-weight: 700;
    color: var(--ttc-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  .ttc-pricing__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .ttc-price-box {
    background: #ffffff;
    border: 1px solid var(--ttc-border);
    border-radius: 12px;
    padding: 12px;
    text-align: center;
  }

  .ttc-price-class {
    font-size: 12px;
    font-weight: 700;
    color: var(--ttc-ink);
    margin-bottom: 6px;
  }

  .ttc-price-amount {
    font-size: 16px;
    font-weight: 800;
    color: var(--ttc-teal-dark);
    margin-bottom: 6px;
  }

  .ttc-seats-info {
    font-size: 11px;
    color: var(--ttc-muted);
    font-weight: 600;
  }

  .ttc-side__price {
    background: linear-gradient(135deg, rgba(42, 181, 181, 0.08), rgba(23, 143, 145, 0.04));
    border: 1px solid rgba(42, 181, 181, 0.2);
    border-radius: 14px;
    padding: 14px 12px;
    text-align: center;
  }

  .ttc-side__price-label {
    font-size: 11px;
    color: var(--ttc-muted);
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .ttc-side__price-amt {
    font-size: 18px;
    font-weight: 800;
    color: var(--ttc-teal-dark);
    line-height: 1.2;
  }

  .ttc-side__price-sub {
    font-size: 11px;
    color: var(--ttc-muted);
    margin-top: 2px;
    font-weight: 600;
  }

  @media (max-width: 980px) {
    .ttc-card__main {
      grid-template-columns: 1fr;
    }

    .ttc-card__side {
      border-left: none;
      border-top: 1px solid var(--ttc-border);
    }

    .ttc-details-info {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 720px) {
    .ttc-time-display {
      grid-template-columns: minmax(60px, auto) 1fr minmax(60px, auto);
      gap: 12px;
      padding: 12px;
    }

    .ttc-time-value {
      font-size: 22px;
    }

    .ttc-time-label {
      font-size: 11px;
    }

    .ttc-duration-badge,
    .ttc-direct-badge {
      font-size: 11px;
    }

    .ttc-flight-no-large {
      font-size: 18px;
    }

    .ttc-details-info {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .ttc-detail-item {
      padding: 8px 10px;
    }

    .ttc-detail-label {
      font-size: 9px;
    }

    .ttc-detail-value {
      font-size: 12px;
    }

    .ttc-summary__title {
      font-size: 24px;
    }

    .ttc-modal__timeline {
      grid-template-columns: 1fr;
      text-align: left;
    }

    .ttc-modal__grid {
      grid-template-columns: 1fr;
    }

    .ttc-pricing__grid {
      grid-template-columns: 1fr;
    }
  }
`

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

function extractCode(value) {
  const match = String(value || '').match(/\(([A-Z]{3})\)/)
  return match ? match[1] : String(value || '').slice(0, 3).toUpperCase()
}

function formatDateLabel(iso) {
  if (!iso) return 'Chưa có ngày'
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return '--:--'
  // Handle time string format "HH:MM"
  if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) {
    return value
  }
  // Handle ISO datetime format
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '--:--'
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(std, sta) {
  if (!std || !sta) return 'Chưa rõ'
  
  // Handle time string format "HH:MM"
  if (typeof std === 'string' && typeof sta === 'string' && /^\d{2}:\d{2}$/.test(std) && /^\d{2}:\d{2}$/.test(sta)) {
    const [stdH, stdM] = std.split(':').map(Number)
    const [staH, staM] = sta.split(':').map(Number)
    let diffMins = (staH * 60 + staM) - (stdH * 60 + stdM)
    
    // If negative, assume arrival is next day
    if (diffMins < 0) diffMins += 24 * 60
    
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins.toString().padStart(2, '0')}m`
  }
  
  // Handle ISO datetime format
  const start = new Date(std)
  const end = new Date(sta)
  const diff = end - start
  if (Number.isNaN(diff) || diff < 0) return 'Chưa rõ'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

function pickNumeric(...values) {
  for (const value of values) {
    const num = Number(value)
    if (Number.isFinite(num) && num > 0) return num
  }
  return 0
}

function resolveFlightPrices(flight) {
  // First, try to extract from seats array (new API format)
  let economy = 0;
  let business = 0;
  
  if (flight?.seats && Array.isArray(flight.seats)) {
    flight.seats.forEach((seat) => {
      if (seat.class === 'ECONOMY') {
        economy = pickNumeric(economy, seat.price);
      } else if (seat.class === 'BUSINESS') {
        business = pickNumeric(business, seat.price);
      }
    });
  }

  // Fallback to other price fields if not found in seats
  economy = pickNumeric(
    economy > 0 ? economy : undefined,
    flight?.prices?.ECONOMY,
    flight?.prices?.economy,
    flight?.fare?.economy,
    flight?.fare?.economy_price,
    flight?.fare_class_prices?.ECONOMY,
    flight?.seat_prices?.ECONOMY,
    flight?.price,
    flight?.base_price,
    flight?.ticket_price,
    flight?.adult_price,
    flight?.adult_fare,
    flight?.amount,
    flight?.fare_amount,
    flight?.raw?.price,
  )

  business = pickNumeric(
    business > 0 ? business : undefined,
    flight?.prices?.BUSINESS,
    flight?.prices?.business,
    flight?.fare?.business,
    flight?.fare?.business_price,
    flight?.fare_class_prices?.BUSINESS,
    flight?.seat_prices?.BUSINESS,
    economy > 0 ? economy * 3 : 0,
  )

  return {
    ECONOMY: economy,
    BUSINESS: business,
  }
}

function mapSearchFlight(groupDate, flight, originInfo = {}, destinationInfo = {}) {
  const prices = resolveFlightPrices(flight)
  
  // Use API data if available, otherwise use provided info from search params
  const origin = flight.origin || originInfo
  const destination = flight.destination || destinationInfo

  return {
    id: flight.id,
    date: groupDate || flight?.std?.slice(0, 10) || '',
    std: flight.std,
    sta: flight.sta,
    depTime: formatTime(flight.std),
    arrTime: formatTime(flight.sta),
    duration: formatDuration(flight.std, flight.sta),
    flightNumber: flight.flight_number || `VN${String(flight.id).padStart(3, '0')}`,
    status: flight.status || 'SCHEDULED',
    originCode: origin?.code || '',
    originName: origin?.name || '',
    originCity: origin?.city || '',
    destinationCode: destination?.code || '',
    destinationName: destination?.name || '',
    destinationCity: destination?.city || '',
    aircraftModel: flight.aircraft || 'Chưa rõ',
    registration: flight.aircraft?.registration || '—',
    airline: 'Vietnam Airlines',
    code: 'VN',
    seat_class: 'ECONOMY',
    class: 'Phổ thông',
    dep: formatTime(flight.std),
    arr: formatTime(flight.sta),
    depCode: flight.origin?.code || '',
    arrCode: flight.destination?.code || '',
    price: prices.ECONOMY,
    prices,
    baggage: 'Theo điều kiện hạng vé',
    checkin: 'Theo điều kiện hạng vé',
    meal: 'Chưa bao gồm',
    wifi: 'Tùy chuyến bay',
    refund: 'Theo điều kiện hạng vé',
    exchange: 'Áp dụng theo quy định',
    logoColor: '#0f6cbd',
    logoText: '#ffffff',
    seats: flight.seats || [],  // Store seats info
    raw: flight,
  }
}

async function fetchAllAirports() {
  const res = await fetch(`${API_BASE}/airports`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : (data.data ?? [])
}

async function searchFlightSchedule({ origin, destination, departureDate, originLabel = '', destinationLabel = '', adults = 1 }) {
  const params = new URLSearchParams({
    origin,
    destination,
    departure_date: departureDate,
    adults: String(adults),
  })

  const res = await fetch(`${API_BASE}/flights/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`)
  }

  // Create origin and destination info from labels
  const originInfo = {
    code: origin,
    name: originLabel.split('–')[0]?.trim() || '',
    city: originLabel.includes('–') ? originLabel.split('–')[1]?.trim() || '' : '',
  }
  
  const destinationInfo = {
    code: destination,
    name: destinationLabel.split('–')[0]?.trim() || '',
    city: destinationLabel.includes('–') ? destinationLabel.split('–')[1]?.trim() || '' : '',
  }

  // Extract outbound data - handle both old format (array) and new format (object with data property)
  const outboundSection = data?.data?.outbound ?? []
  const outboundGroups = Array.isArray(outboundSection) ? outboundSection : (outboundSection?.data ?? [])
  
  const flights = outboundGroups.flatMap((group) =>
    (group?.flights ?? []).map((flight) => mapSearchFlight(group?.date, flight, originInfo, destinationInfo))
  )

  return flights
}

function DetailModal({ flight, onClose }) {
  if (!flight) return null

  return (
    <div className="ttc-modal-backdrop" onClick={onClose}>
      <div className="ttc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ttc-modal__hero">
          <div className="ttc-modal__eyebrow">Chi tiết chuyến bay</div>
          <div className="ttc-modal__title">{flight.originCode} → {flight.destinationCode}</div>
          <div className="ttc-modal__sub">
            {flight.flightNumber} · {formatDateLabel(flight.date)} · {flight.aircraftModel}
          </div>
        </div>

        <div className="ttc-modal__body">
          <div className="ttc-modal__timeline">
            <div className="ttc-stop">
              <div className="ttc-time">{flight.depTime}</div>
              <div className="ttc-code">{flight.originCode}</div>
              <div className="ttc-airport">{flight.originName}</div>
              <div className="ttc-city">{flight.originCity}</div>
            </div>

            <div className="ttc-middle">
              <div className="ttc-duration">{flight.duration}</div>
              <div className="ttc-line" />
              <div className="ttc-direct">Bay thẳng</div>
            </div>

            <div className="ttc-stop ttc-stop--right">
              <div className="ttc-time">{flight.arrTime}</div>
              <div className="ttc-code">{flight.destinationCode}</div>
              <div className="ttc-airport">{flight.destinationName}</div>
              <div className="ttc-city">{flight.destinationCity}</div>
            </div>
          </div>

          <div className="ttc-modal__grid">
            {[
              ['Ngày bay', formatDateLabel(flight.date)],
              ['Số hiệu chuyến', flight.flightNumber],
              ['Tình trạng', flight.status],
              ['Máy bay', flight.aircraftModel],
              ['Điểm đi', `${flight.originCity} (${flight.originCode})`],
              ['Điểm đến', `${flight.destinationCity} (${flight.destinationCode})`],
              ['Khởi hành / đến', `${flight.depTime} - ${flight.arrTime}`],
            ].map(([label, value]) => (
              <div key={label} className="ttc-modal__kv">
                <div className="ttc-modal__kv-label">{label}</div>
                <div className="ttc-modal__kv-value">{value}</div>
              </div>
            ))}
          </div>

          {/* Pricing & Seats */}
          {(flight.prices?.ECONOMY || flight.prices?.BUSINESS || flight.seats?.length > 0) && (
            <div className="ttc-modal__pricing">
              <div className="ttc-modal__pricing-title">Giá vé & Số ghế</div>
              <div className="ttc-modal__pricing-grid">
                <div className="ttc-modal__price-item">
                  <div className="ttc-modal__price-label">💺 Phổ thông (Economy)</div>
                  <div className="ttc-modal__price-value">
                    {flight.prices?.ECONOMY 
                      ? `${(flight.prices.ECONOMY).toLocaleString('vi-VN')}₫` 
                      : 'N/A'}
                  </div>
                  {flight.seats?.find(s => s.class === 'ECONOMY') && (
                    <div className="ttc-modal__seats">
                      Còn {flight.seats.find(s => s.class === 'ECONOMY')?.available || 0} ghế
                    </div>
                  )}
                </div>
                <div className="ttc-modal__price-item">
                  <div className="ttc-modal__price-label">👑 Thương gia (Business)</div>
                  <div className="ttc-modal__price-value">
                    {flight.prices?.BUSINESS 
                      ? `${(flight.prices.BUSINESS).toLocaleString('vi-VN')}₫` 
                      : 'N/A'}
                  </div>
                  {flight.seats?.find(s => s.class === 'BUSINESS') && (
                    <div className="ttc-modal__seats">
                      Còn {flight.seats.find(s => s.class === 'BUSINESS')?.available || 0} ghế
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="ttc-modal__actions">
            <button type="button" className="ttc-btn ttc-btn--ghost" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TabTraCuu({ initialDestination }) {
  const navigate = useNavigate()
  const [from, setFrom] = useState(initialDestination?.from || 'Nội Bài (HAN) – Hà Nội')
  const [to, setTo] = useState(initialDestination?.to || '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [airports, setAirports] = useState([])
  const [airportsLoading, setAirportsLoading] = useState(false)
  const [airportsError, setAirportsError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [sortBy, setSortBy] = useState('departure')
  const [selectedFlight, setSelectedFlight] = useState(null)
  const fromRef = useRef(null)
  const toRef = useRef(null)
  const dateRef = useRef(null)

  useEffect(() => {
    if (initialDestination?.from) setFrom(initialDestination.from)
    if (initialDestination?.to) setTo(initialDestination.to)
  }, [initialDestination])

  useEffect(() => {
    let ignore = false
    const run = async () => {
      setAirportsLoading(true)
      setAirportsError('')
      try {
        const data = await fetchAllAirports()
        if (!ignore) {
          const labels = data.map(normalizeAirportLabel).filter(Boolean)
          setAirports([...new Set(labels)])
        }
      } catch {
        if (!ignore) {
          setAirports(FALLBACK_AIRPORTS)
          setAirportsError('Không tải được danh sách sân bay, đang dùng dữ liệu mặc định.')
        }
      } finally {
        if (!ignore) setAirportsLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [])

  const airportOptions = useMemo(() => (
    airports.length > 0 ? airports : FALLBACK_AIRPORTS
  ), [airports])

  const sortedResults = useMemo(() => {
    const arr = [...results]
    arr.sort((a, b) => {
      if (sortBy === 'arrival') return a.arrTime.localeCompare(b.arrTime)
      if (sortBy === 'duration') {
        const mins = (value) => {
          const match = String(value).match(/(\d+)h\s+(\d+)m/)
          return match ? Number(match[1]) * 60 + Number(match[2]) : 0
        }
        return mins(a.duration) - mins(b.duration)
      }
      return a.depTime.localeCompare(b.depTime)
    })
    return arr
  }, [results, sortBy])

  const swap = () => {
    const currentFrom = from
    setFrom(to)
    setTo(currentFrom)
  }

  useEffect(() => {
    if (from && to && extractCode(from) === extractCode(to)) {
      setTo('')
    }
  }, [from, to])

  const runSearch = async () => {
    if (!from) {
      setError('Vui lòng chọn điểm đi.')
      fromRef.current?.focus?.()
      return
    }
    if (!to) {
      setError('Vui lòng chọn điểm đến.')
      toRef.current?.focus?.()
      return
    }
    if (extractCode(from) === extractCode(to)) {
      setError('Điểm đi và điểm đến không được trùng nhau.')
      toRef.current?.focus?.()
      return
    }
    if (!date) {
      setError('Vui lòng chọn ngày bay.')
      dateRef.current?.querySelector('button')?.focus?.()
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      const flights = await searchFlightSchedule({
        origin: extractCode(from),
        destination: extractCode(to),
        departureDate: date,
        originLabel: from,
        destinationLabel: to,
      })

      if (!flights.length) {
        setError('Không tìm thấy chuyến bay cho hành trình này.')
      } else {
        setResults(flights)
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu lịch bay.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFlight = (flight) => {
    navigate('/buy-ticket', {
      state: {
        flight,
        searchData: {
          from: extractCode(from),
          to: extractCode(to),
          fromLabel: from,
          toLabel: to,
          date,
          retDate: '',
          passengers: '1',
          tripType: 'one',
        },
      },
    })
  }

  return (
    <>
      <style>{css}</style>
      <div className="tab-content ttc-root">
        <div className="ttc-top">
          <div className="form-row">
            <div className="form-field">
              <label className="form-field__label">Hành trình</label>
              <div className="radio-group" style={{ marginBottom: 0 }}>
                <label className="radio-label">
                  <input type="radio" checked readOnly />
                  Một chiều
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-field__label">✈️ Điểm đi</label>
              <select
                ref={fromRef}
                className="form-field__input"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                disabled={airportsLoading}
              >
                {airportOptions.filter(item => item !== to).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <button type="button" className="swap-btn" onClick={swap} title="Đổi chiều">⇄</button>

            <div className="form-field">
              <label className="form-field__label">🛬 Điểm đến</label>
              <select
                ref={toRef}
                className="form-field__input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={airportsLoading}
              >
                <option value="">-- Chọn điểm đến --</option>
                {airportOptions.filter((item) => item !== from).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          {airportsError && <div className="ttc-error">{airportsError}</div>}

          <div className="form-row">
            <div className="form-field">
              <div ref={dateRef}>
                <DatePicker
                  label="📅 Ngày đi"
                  value={date}
                  onChange={setDate}
                  theme="light"
                  className="form-field"
                />
              </div>
            </div>

            <button type="button" className="btn-primary" onClick={runSearch} disabled={loading}>
              {loading ? 'Đang tìm...' : 'Tìm lịch bay'}
            </button>
          </div>
        </div>

        {error && <div className="ttc-error">{error}</div>}

        {loading && <div className="ttc-loading">Đang tải lịch bay...</div>}

        {!!sortedResults.length && (
          <>
            <div className="ttc-summary">
              <div>
                <div className="ttc-summary__title">Tra cứu lịch bay</div>
               
              </div>
              <div className="ttc-route-badge">
                <span>{extractCode(from)}</span>
                <span>→</span>
                <span>{extractCode(to)}</span>
                <span>·</span>
                <span>{formatDateLabel(date)}</span>
              </div>
            </div>

            <div className="ttc-toolbar">
              <div className="ttc-toolbar__left">
                <span className="ttc-toolbar__label">Sắp xếp theo</span>
                {[
                  ['departure', 'Giờ khởi hành'],
                  ['arrival', 'Giờ đến'],
                  ['duration', 'Thời gian bay'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`ttc-sort-btn${sortBy === key ? ' ttc-sort-btn--active' : ''}`}
                    onClick={() => setSortBy(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="ttc-count">{sortedResults.length} chuyến bay</div>
            </div>

            <div className="ttc-list">
              {sortedResults.map((flight) => (
                <article key={flight.id} className="ttc-card">
                  <div className="ttc-card__main">
                    <div className="ttc-card__flight">
                      {/* Header: Flight Number and Status */}
                      <div className="ttc-flight-header">
                        <div className="ttc-flight-info">
                          <span className="ttc-flight-no-large">{flight.flightNumber}</span>
                          <span className="ttc-status-badge">{flight.status}</span>
                        </div>
                      </div>

                      {/* Main Time Display */}
                      <div className="ttc-time-display">
                        <div className="ttc-time-section">
                          <div className="ttc-time-value">{flight.depTime}</div>
                          <div className="ttc-time-label">{flight.originCode}</div>
                        </div>
                        <div className="ttc-time-middle">
                          <div className="ttc-duration-badge">{flight.duration}</div>
                          <div className="ttc-line" />
                          <div className="ttc-direct-badge">Bay thẳng</div>
                        </div>
                        <div className="ttc-time-section">
                          <div className="ttc-time-value">{flight.arrTime}</div>
                          <div className="ttc-time-label">{flight.destinationCode}</div>
                        </div>
                      </div>

                      {/* Details Info */}
                      <div className="ttc-details-info">
                        <div className="ttc-detail-item">
                          <span className="ttc-detail-label">📅 Ngày:</span>
                          <span className="ttc-detail-value">{formatDateLabel(flight.date)}</span>
                        </div>
                        <div className="ttc-detail-item">
                          <span className="ttc-detail-label">✈️ Tàu bay:</span>
                          <span className="ttc-detail-value">{flight.aircraftModel}</span>
                        </div>
                        <div className="ttc-detail-item">
                          <span className="ttc-detail-label">⏱️ Thời gian bay:</span>
                          <span className="ttc-detail-value">{flight.duration}</span>
                        </div>
                      </div>

                      {/* Pricing & Seats Info */}
                      <div className="ttc-pricing">
                        <div className="ttc-pricing__title">Giá vé</div>
                        <div className="ttc-pricing__grid">
                          <div className="ttc-price-box">
                            <div className="ttc-price-class">💺 Phổ thông</div>
                            <div className="ttc-price-amount">
                              {flight.prices?.ECONOMY 
                                ? `${(flight.prices.ECONOMY / 1000000).toFixed(1)}M` 
                                : 'N/A'}
                            </div>
                            {flight.seats?.find(s => s.class === 'ECONOMY') && (
                              <div className="ttc-seats-info">
                                Còn {flight.seats.find(s => s.class === 'ECONOMY')?.available || 0} ghế
                              </div>
                            )}
                          </div>
                          <div className="ttc-price-box">
                            <div className="ttc-price-class">👑 Thương gia</div>
                            <div className="ttc-price-amount">
                              {flight.prices?.BUSINESS 
                                ? `${(flight.prices.BUSINESS / 1000000).toFixed(1)}M` 
                                : 'N/A'}
                            </div>
                            {flight.seats?.find(s => s.class === 'BUSINESS') && (
                              <div className="ttc-seats-info">
                                Còn {flight.seats.find(s => s.class === 'BUSINESS')?.available || 0} ghế
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ttc-card__side">
                      <div className="ttc-side__top">
                        <div className="ttc-date">{formatDateLabel(flight.date)}</div>
                        <div className="ttc-date-sub">Tuyến {flight.originCity} → {flight.destinationCity}</div>
                        <div className="ttc-flight-no">{flight.flightNumber}</div>
                      </div>

                      <div className="ttc-side__price">
                        <div className="ttc-side__price-label">Từ</div>
                        <div className="ttc-side__price-amt">
                          {flight.prices?.ECONOMY 
                            ? `${(flight.prices.ECONOMY).toLocaleString('vi-VN')}₫` 
                            : 'N/A'}
                        </div>
                        <div className="ttc-side__price-sub">/người</div>
                      </div>

                      <div className="ttc-cta">
                        <button type="button" className="ttc-btn ttc-btn--ghost" onClick={() => setSelectedFlight(flight)}>
                          Xem chi tiết
                        </button>
                        <button type="button" className="ttc-btn ttc-btn--primary" onClick={() => handleSelectFlight(flight)}>
                          Chọn chuyến bay
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {!loading && !error && !sortedResults.length && (
          <div className="ttc-empty">
            Chọn điểm đi, điểm đến và ngày bay để tra cứu chuyến bay.
          </div>
        )}
      </div>

      <DetailModal flight={selectedFlight} onClose={() => setSelectedFlight(null)} />
    </>
  )
}
