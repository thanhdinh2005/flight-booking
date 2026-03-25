// src/components/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Topbar.css';
import timkiem from '../assets/tìm kiếm.png';
import avata   from '../assets/avata.png';
import ProfileModal from './Profilemodal';

// Advanced search configuration
const ADVANCED_FIELDS = [
  { id: 'origin',      label: 'Từ',       placeholder: 'HAN',     width: 'short'  },
  { id: 'destination', label: 'Đến',      placeholder: 'SGN',     width: 'short'  },
  { id: 'date',        label: 'Ngày',     placeholder: '',        type: 'date',   width: 'medium' },
  { id: 'price',       label: 'Giá tối đa', placeholder: '1000000', type: 'number', width: 'medium' },
];

export default function Topbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [avatarOpen,     setAvatarOpen]     = useState(false);
  const [searchVal,      setSearchVal]      = useState('');
  const [isExpanded,     setIsExpanded]     = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [advancedValues, setAdvancedValues] = useState({
    origin: '', destination: '', date: '', price: ''
  });
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

  // Simple search
  function handleSimpleSearch(e) {
    e.preventDefault();
    if (!searchVal.trim()) return;
    navigate(`/flights?q=${encodeURIComponent(searchVal.trim())}`);
    setSearchVal('');
    setIsExpanded(false);
  }

  // Advanced search
  function handleAdvancedSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(advancedValues).forEach(([key, value]) => {
      if (value.trim()) params.append(key, value.trim());
    });
    if (params.toString()) {
      navigate(`/flights?${params.toString()}`);
      setAdvancedValues({ origin: '', destination: '', date: '', price: '' });
      setIsExpanded(false);
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

  const hasAdvancedValues = Object.values(advancedValues).some(v => v.trim());

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
                      <input
                        type={field.type || 'text'}
                        className="field-input"
                        placeholder={field.placeholder}
                        value={advancedValues[field.id]}
                        onChange={e => handleAdvancedChange(field.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div className="advanced-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setAdvancedValues({ origin: '', destination: '', date: '', price: '' })}
                  >
                    Đặt lại
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!hasAdvancedValues}
                  >
                    Tìm kiếm
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
                  <button className="topbar__dropdown-item" onClick={() => { setAvatarOpen(false); navigate('/settings'); }}>
                    <span>⚙️</span> Cài đặt
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