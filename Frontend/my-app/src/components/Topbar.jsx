// src/components/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Topbar.css';
import timkiem from '../assets/tìm kiếm.png';
import avata   from '../assets/avata.png';

export default function Topbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [searchVal,  setSearchVal]  = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const dropRef  = useRef(null);
  const inputRef = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function onClickOut(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  // Tìm kiếm → điều hướng sang FlightResults
  function handleSearch(e) {
    e.preventDefault();
    if (!searchVal.trim()) return;
    navigate(`/flights?q=${encodeURIComponent(searchVal.trim())}`);
    setSearchVal('');
    setSearchFocused(false);
  }

  function handleLogout() {
    setAvatarOpen(false);
    onLogout?.();
  }

  const initials = currentUser
    ? (currentUser.name || currentUser.preferred_username || 'U')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'KH';

  return (
    <header className="topbar">
      {/* Logo */}
      <a className="topbar__logo" href="/home">
        <span className="topbar__logo-icon">✈️</span>
        <span className="topbar__logo-text">Việt<strong>Jett</strong></span>
      </a>

      {/* Search bar */}
      <form
        className={`topbar__search${searchFocused ? ' topbar__search--focused' : ''}`}
        onSubmit={handleSearch}
      >
        <img src={timkiem} alt="" className="topbar__search-icon" />
        <input
          ref={inputRef}
          className="topbar__search-input"
          placeholder="Tìm chuyến bay, điểm đến..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchVal && (
          <button type="submit" className="topbar__search-submit">→</button>
        )}
      </form>

      {/* Avatar + dropdown */}
      <div className="topbar__avatar-wrap" ref={dropRef}>
        <button
          className={`topbar__avatar-btn${avatarOpen ? ' topbar__avatar-btn--open' : ''}`}
          onClick={() => setAvatarOpen(p => !p)}
          title="Tài khoản"
        >
          {currentUser
            ? <span className="topbar__avatar-initials">{initials}</span>
            : <img src={avata} alt="Tài khoản" className="topbar__avatar-img" />
          }
          <span className="topbar__avatar-caret">{avatarOpen ? '▲' : '▼'}</span>
        </button>

        {avatarOpen && (
          <div className="topbar__dropdown">
            <div className="topbar__dropdown-header">
              <div className="topbar__dropdown-avatar">{initials}</div>
              <div>
                <div className="topbar__dropdown-name">
                  {currentUser?.name || currentUser?.preferred_username || 'Khách hàng'}
                </div>
                <div className="topbar__dropdown-email">
                  {currentUser?.email || 'Chưa đăng nhập'}
                </div>
              </div>
            </div>

            <div className="topbar__dropdown-divider" />

            <button className="topbar__dropdown-item" onClick={() => { setAvatarOpen(false); navigate('/profile'); }}>
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
          </div>
        )}
      </div>
    </header>
  );
}