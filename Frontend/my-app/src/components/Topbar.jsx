// src/components/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Topbar.css';
import timkiem from '../assets/tìm kiếm.png';
import avata   from '../assets/avata.png';
import ProfileModal from './Profilemodal';

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api';

// Advanced search configuration
const ADVANCED_FIELDS = [
  { id: 'origin',      label: 'Từ',       placeholder: 'HAN',     width: 'short', kind: 'airport'  },
  { id: 'destination', label: 'Đến',      placeholder: 'SGN',     width: 'short', kind: 'airport'  },
  { id: 'departure_date', label: 'Ngày đi', placeholder: '',      width: 'medium', kind: 'date' },
  { id: 'return_date',    label: 'Ngày về', placeholder: '',      width: 'medium', kind: 'date' },
];

const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const DOWS = ['CN','T2','T3','T4','T5','T6','T7'];

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function buildDefaultAdvancedValues(airportOptions = []) {
  return {
    origin: airportOptions[0]?.value ?? '',
    destination: airportOptions.find(option => option.value !== airportOptions[0]?.value)?.value ?? '',
    departure_date: getTodayIso(),
    return_date: '',
  };
}

function normalizeAirportOption(airport) {
  const code = airport.iata_code ?? airport.code ?? airport.id ?? '';
  const name = airport.name ?? airport.airport_name ?? '';
  const city = airport.city ?? airport.city_name ?? airport.location ?? '';
  return {
    value: code,
    label: `${code}${city ? ` - ${city}` : name ? ` - ${name}` : ''}`,
  };
}

async function fetchTopbarAirports() {
  const res = await fetch(`${API_BASE}/airports`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map(normalizeAirportOption).filter(item => item.value);
}

async function fetchTopbarFlights({ origin, destination, departure_date, return_date, adults = '1' }) {
  const params = new URLSearchParams({
    origin,
    destination,
    departure_date,
    adults: String(adults),
  });
  if (return_date) params.append('return_date', return_date);

  const res = await fetch(`${API_BASE}/flights/search?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

function MiniCalendar({ value, onChange, onClose }) {
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const initial = value ? new Date(`${value}T00:00:00`) : todayOnly;
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const pad = cells.length % 7 ? 7 - (cells.length % 7) : 0;
  for (let i = 0; i < pad; i++) cells.push(null);

  const selected = value ? new Date(`${value}T00:00:00`) : null;

  function moveMonth(delta) {
    if (month + delta < 0) {
      setMonth(11);
      setYear(y => y - 1);
      return;
    }
    if (month + delta > 11) {
      setMonth(0);
      setYear(y => y + 1);
      return;
    }
    setMonth(m => m + delta);
  }

  function pick(day) {
    if (!day) return;
    const picked = new Date(year, month, day);
    if (picked < todayOnly) return;
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(iso);
    onClose();
  }

  function cellClass(day) {
    if (!day) return 'topbar-cal__cell topbar-cal__cell--empty';
    const current = new Date(year, month, day);
    const isPast = current < todayOnly;
    const isToday = current.getTime() === todayOnly.getTime();
    const isSelected = selected && current.getTime() === selected.getTime();
    return [
      'topbar-cal__cell',
      isPast && 'topbar-cal__cell--past',
      isToday && 'topbar-cal__cell--today',
      isSelected && 'topbar-cal__cell--selected',
    ].filter(Boolean).join(' ');
  }

  return (
    <div className="topbar-cal">
      <div className="topbar-cal__nav">
        <button type="button" className="topbar-cal__nav-btn" onClick={() => moveMonth(-1)}>‹</button>
        <div className="topbar-cal__title">{MONTHS[month]} {year}</div>
        <button type="button" className="topbar-cal__nav-btn" onClick={() => moveMonth(1)}>›</button>
      </div>
      <div className="topbar-cal__dow">
        {DOWS.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="topbar-cal__grid">
        {cells.map((day, index) => (
          <button
            key={`${day ?? 'e'}-${index}`}
            type="button"
            className={cellClass(day)}
            onClick={() => pick(day)}
            disabled={!day}
          >
            {day || ''}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Topbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [avatarOpen,     setAvatarOpen]     = useState(false);
  const [searchVal,      setSearchVal]      = useState('');
  const [isExpanded,     setIsExpanded]     = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [advancedValues, setAdvancedValues] = useState(() => buildDefaultAdvancedValues());
  const [airports, setAirports]             = useState([]);
  const [airportsError, setAirportsError]   = useState('');
  const [calendarOpen, setCalendarOpen]     = useState(null);
  const [searchingFlights, setSearchingFlights] = useState(false);
  const dropRef   = useRef(null);
  const searchRef = useRef(null);

  const isLoggedIn = !!currentUser;

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function onClickOut(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadAirports() {
      try {
        const airportOptions = await fetchTopbarAirports();
        if (!ignore) {
          setAirports(airportOptions);
          setAdvancedValues(prev => ({
            origin: prev.origin || airportOptions[0]?.value || '',
            destination: prev.destination || airportOptions.find(option => option.value !== (prev.origin || airportOptions[0]?.value))?.value || '',
            departure_date: prev.departure_date || getTodayIso(),
            return_date: prev.return_date || '',
          }));
          setAirportsError('');
        }
      } catch {
        if (!ignore) setAirportsError('Không tải được danh sách sân bay');
      }
    }

    loadAirports();
    return () => { ignore = true; };
  }, []);

  // Simple search
  function handleSimpleSearch(e) {
    e.preventDefault();
    if (!searchVal.trim()) return;
    navigate(`/flights?q=${encodeURIComponent(searchVal.trim())}`);
    setSearchVal('');
    setIsExpanded(false);
  }

  // Advanced search
  async function handleAdvancedSearch(e) {
    e.preventDefault();
    const { origin, destination, departure_date, return_date } = advancedValues;

    if (!origin || !destination || !departure_date) return;
    if (origin === destination) return;
    if (return_date && return_date < departure_date) return;

    const params = new URLSearchParams();
    params.append('origin', origin);
    params.append('destination', destination);
    params.append('departure_date', departure_date);
    if (return_date) params.append('return_date', return_date);
    params.append('adults', '1');

    setSearchingFlights(true);
    try {
      const prefetchedResult = await fetchTopbarFlights({
        origin,
        destination,
        departure_date,
        return_date,
        adults: '1',
      });

      navigate(`/flights?${params.toString()}`, {
        state: {
          prefetchedResult,
          prefetchedQuery: params.toString(),
        },
      });
      setIsExpanded(false);
      setCalendarOpen(null);
    } catch (err) {
      console.error('[Topbar] searchFlights failed:', err);
    } finally {
      setSearchingFlights(false);
    }
  }

  function handleAdvancedChange(fieldId, value) {
    setAdvancedValues(prev => ({ ...prev, [fieldId]: value }));
  }

  function handleLogout() {
    setAvatarOpen(false);
    onLogout?.();
  }

  // Open profile modal
  function handleOpenProfile() {
    setAvatarOpen(false);
    setProfileOpen(true);
  }

  // Nếu chưa đăng nhập thì hiện avatar mặc định, không hiện initials
  const initials = isLoggedIn
    ? (currentUser.name || currentUser.preferred_username || 'U')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : null;

  const canSearchAdvanced =
    !!advancedValues.origin &&
    !!advancedValues.destination &&
    !!advancedValues.departure_date &&
    advancedValues.origin !== advancedValues.destination &&
    (!advancedValues.return_date || advancedValues.return_date >= advancedValues.departure_date);

  return (
    <>
      <header className="topbar">
        {/* Logo */}
        <a className="topbar__logo" href="/home">
          <span className="topbar__logo-icon">✈️</span>
          <span className="topbar__logo-text">Việt<strong>Jett</strong></span>
        </a>

        {/* Search Component */}
        <div className="topbar__search-wrapper" ref={searchRef}>
          <div className={`topbar__search-main ${isExpanded ? 'expanded' : ''}`}>
            <form className="search-simple" onSubmit={handleSimpleSearch}>
              <img src={timkiem} alt="" className="search-icon" />
              <input
                className="search-input"
                placeholder="Tìm chuyến bay, điểm đến..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onFocus={() => setIsExpanded(true)}
              />
              {searchVal && (
                <button type="submit" className="search-btn">→</button>
              )}
            </form>

            <button
              className={`expand-toggle ${isExpanded ? 'active' : ''}`}
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Thu gọn' : 'Mở rộng tìm kiếm'}
            >
              <span className="expand-dots">⋮⋮</span>
            </button>
          </div>

          {isExpanded && (
            <div className="search-advanced-panel">
              <div className="advanced-header">
                <span className="advanced-title">🔍 Tìm kiếm nâng cao</span>
                <button className="advanced-close" onClick={() => setIsExpanded(false)}>✕</button>
              </div>
              <form className="advanced-form" onSubmit={handleAdvancedSearch}>
                <div className="advanced-grid">
                  {ADVANCED_FIELDS.map(field => (
                    <div key={field.id} className={`advanced-field ${field.width}`}>
                      <label className="field-label">{field.label}</label>
                      {field.kind === 'airport' ? (
                        <select
                          className="field-input"
                          value={advancedValues[field.id]}
                          onChange={e => handleAdvancedChange(field.id, e.target.value)}
                        >
                          {airports
                            .filter(option => field.id !== 'destination' || option.value !== advancedValues.origin)
                            .filter(option => field.id !== 'origin' || option.value !== advancedValues.destination)
                            .map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                      ) : field.kind === 'date' ? (
                        <div className="topbar-date-field">
                          <button
                            type="button"
                            className={`field-input topbar-date-trigger${calendarOpen === field.id ? ' topbar-date-trigger--open' : ''}`}
                            onClick={() => setCalendarOpen(open => open === field.id ? null : field.id)}
                          >
                            <span>
                              {advancedValues[field.id]
                                ? advancedValues[field.id].split('-').reverse().join('/')
                                : field.id === 'departure_date'
                                  ? 'Chọn ngày đi'
                                  : 'Chọn ngày về'}
                            </span>
                            <span className="topbar-date-trigger__icon">📅</span>
                          </button>
                          {calendarOpen === field.id && (
                            <MiniCalendar
                              value={advancedValues[field.id]}
                              onChange={value => {
                                handleAdvancedChange(field.id, value);
                                if (field.id === 'departure_date' && advancedValues.return_date && advancedValues.return_date < value) {
                                  handleAdvancedChange('return_date', '');
                                }
                              }}
                              onClose={() => setCalendarOpen(null)}
                            />
                          )}
                        </div>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          className="field-input"
                          placeholder={field.placeholder}
                          value={advancedValues[field.id]}
                          onChange={e => handleAdvancedChange(field.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {airportsError && (
                  <div className="advanced-error">{airportsError}</div>
                )}
                <div className="advanced-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setAdvancedValues(buildDefaultAdvancedValues(airports));
                      setCalendarOpen(null);
                    }}
                  >
                    Đặt lại
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!canSearchAdvanced || searchingFlights}
                  >
                    {searchingFlights ? 'Đang tìm...' : 'Tìm kiếm'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Avatar + dropdown */}
        <div className="topbar__avatar-wrap" ref={dropRef}>
          <button
            className={`topbar__avatar-btn${avatarOpen ? ' topbar__avatar-btn--open' : ''}`}
            onClick={() => setAvatarOpen(p => !p)}
            title="Tài khoản"
          >
            {/* Luôn hiện avatar mặc định nếu chưa đăng nhập */}
            {isLoggedIn
              ? <span className="topbar__avatar-initials">{initials}</span>
              : <img src={avata} alt="Tài khoản" className="topbar__avatar-img" />
            }
            <span className="topbar__avatar-caret">{avatarOpen ? '▲' : '▼'}</span>
          </button>

          {avatarOpen && (
            <div className="topbar__dropdown">
              <div className="topbar__dropdown-header">
                {/* Header dropdown: avatar mặc định nếu chưa đăng nhập */}
                {isLoggedIn
                  ? <div className="topbar__dropdown-avatar">{initials}</div>
                  : <img src={avata} alt="Tài khoản" className="topbar__dropdown-avatar-img" />
                }
                <div>
                  <div className="topbar__dropdown-name">
                    {isLoggedIn
                      ? (currentUser.name || currentUser.preferred_username)
                      : 'Khách'}
                  </div>
                  <div className="topbar__dropdown-email">
                    {isLoggedIn ? currentUser.email : 'Chưa đăng nhập'}
                  </div>
                </div>
              </div>

              <div className="topbar__dropdown-divider" />

              {isLoggedIn ? (
                <>
                  <button className="topbar__dropdown-item" onClick={handleOpenProfile}>
                    <span>👤</span> Thông tin cá nhân
                  </button>
                  <button className="topbar__dropdown-item" onClick={() => { setAvatarOpen(false); navigate('/my-tickets'); }}>
                    <span>🎫</span> Vé của tôi
                  </button>

                  <div className="topbar__dropdown-divider" />

                  <button className="topbar__dropdown-item topbar__dropdown-item--danger" onClick={handleLogout}>
                    <span>→</span> Đăng xuất
                  </button>
                </>
              ) : (
                /* Chưa đăng nhập: chỉ hiện nút đăng nhập / đăng ký */
                <>
                  <button className="topbar__dropdown-item" onClick={() => { setAvatarOpen(false); navigate('/login'); }}>
                    <span>🔑</span> Đăng nhập
                  </button>
                  <button className="topbar__dropdown-item" onClick={() => { setAvatarOpen(false); navigate('/login?register=true'); }}>
                    <span>📝</span> Đăng ký
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Profile Modal - chỉ mở khi đã đăng nhập */}
      {profileOpen && isLoggedIn && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}
