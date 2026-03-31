// src/components/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Topbar.css';
import timkiem from '../assets/tìm kiếm.png';
import avata   from '../assets/avata.png';
import ProfileModal from './Profilemodal';
import DatePicker from './common/DatePicker';

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api';

// Advanced search configuration
const ADVANCED_FIELDS = [
  { id: 'origin',      label: 'Từ',       placeholder: 'HAN',     width: 'short', kind: 'airport'  },
  { id: 'destination', label: 'Đến',      placeholder: 'SGN',     width: 'short', kind: 'airport'  },
  { id: 'departure_date', label: 'Ngày đi', placeholder: '',      width: 'medium', kind: 'date' },
  { id: 'return_date',    label: 'Ngày về', placeholder: '',      width: 'medium', kind: 'date' },
];

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
  const params = buildFlightSearchParams({ origin, destination, departure_date, return_date, adults });

  const res = await fetch(`${API_BASE}/flights/search?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

function buildFlightSearchParams({ origin, destination, departure_date, return_date, adults }) {
  const params = new URLSearchParams();

  params.append('origin', origin);
  params.append('destination', destination);
  params.append('departure_date', departure_date);

  if (return_date) {
    params.append('return_date', return_date);
  }

  params.append('adults', String(adults ?? 1));

  return params;
}

export default function Topbar({ currentUser, onLogout, onMenuToggle }) {
  const navigate = useNavigate();
  const [avatarOpen,     setAvatarOpen]     = useState(false);
  const [searchVal,      setSearchVal]      = useState('');
  const [isExpanded,     setIsExpanded]     = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [advancedValues, setAdvancedValues] = useState(() => buildDefaultAdvancedValues());
  const [airports, setAirports]             = useState([]);
  const [airportsError, setAirportsError]   = useState('');
  const [searchingFlights, setSearchingFlights] = useState(false);
  const [searchError, setSearchError]       = useState('');
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
    const { origin, destination, departure_date, return_date, adults } = advancedValues;

    setSearchError('');

    if (!origin || !destination || !departure_date) {
      setSearchError('Vui lòng chọn đầy đủ điểm đi, điểm đến và ngày đi.');
      return;
    }
    if (origin === destination) {
      setSearchError('Điểm đi và điểm đến không được trùng nhau.');
      return;
    }
    if (return_date && return_date < departure_date) {
      setSearchError('Ngày về không được sớm hơn ngày đi.');
      return;
    }

    const adultsValue = adults ?? 1;
    const params = buildFlightSearchParams({
      origin,
      destination,
      departure_date,
      return_date,
      adults: adultsValue,
    });

    setSearchingFlights(true);
    try {
      const prefetchedResult = await fetchTopbarFlights({
        origin,
        destination,
        departure_date,
        return_date,
        adults: adultsValue,
      });

      navigate('/flightspage', {
        state: {
          prefetchedResult,
          searchData: {
            origin,
            destination,
            departure_date,
            return_date,
            adults: String(adultsValue),
          },
        },
      });
      setIsExpanded(false);
      setSearchError('');
    } catch (err) {
      console.error('[Topbar] searchFlights failed:', err);
      setSearchError(err instanceof Error ? err.message : 'Không thể tìm chuyến bay lúc này.');
    } finally {
      setSearchingFlights(false);
    }
  }

  function handleAdvancedChange(fieldId, value) {
    setSearchError('');
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
        <button
          type="button"
          className="topbar__menu-btn"
          onClick={onMenuToggle}
          aria-label="Mở menu điều hướng"
        >
          ☰
        </button>

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
                          <DatePicker
                            value={advancedValues[field.id]}
                            placeholder={field.id === 'departure_date' ? 'Chọn ngày đi' : 'Chọn ngày về'}
                            minDate={field.id === 'return_date' ? advancedValues.departure_date : undefined}
                            onChange={value => {
                              handleAdvancedChange(field.id, value);
                              if (field.id === 'departure_date' && advancedValues.return_date && advancedValues.return_date < value) {
                                handleAdvancedChange('return_date', '');
                              }
                            }}
                            theme="light"
                            triggerClassName="field-input topbar-date-trigger"
                          />
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
                {(airportsError || searchError) && (
                  <div className="advanced-error" role="alert" aria-live="polite">
                    {airportsError || searchError}
                  </div>
                )}
                <div className="advanced-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setAdvancedValues(buildDefaultAdvancedValues(airports));
                      setSearchError('');
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
