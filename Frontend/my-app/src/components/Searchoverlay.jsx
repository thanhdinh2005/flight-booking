// src/components/SearchOverlay.jsx
import { useState } from 'react';
import '../styles/Toast.css'; // SearchOverlay styles are bundled here

const SUGGESTIONS = [
  'HCM → Hà Nội',
  'HCM → Đà Nẵng',
  'HCM → Phú Quốc',
  'Hà Nội → Đà Lạt',  
  'Đà Nẵng → Hà Nội',
  'Hà Nội → Nha Trang',
];

/**
 * SearchOverlay – full-screen modal search.
 * Props:
 *   isOpen   {boolean}
 *   onClose  {() => void}
 *   onSelect {(suggestion: string) => void}
 */
export default function SearchOverlay({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');

  const filtered = query
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : [];

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleSelect(s) {
    setQuery('');
    onClose();
    onSelect(s);
  }

  return (
    <div
      className={`search-overlay ${isOpen ? 'search-overlay--active' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className="search-overlay__box">
        <div className="search-overlay__header">
          <span className="search-overlay__title">🔍 Tìm kiếm</span>
          <button className="search-overlay__close" onClick={onClose}>✕</button>
        </div>

        <input
          className="search-overlay__input"
          type="text"
          placeholder="Nhập điểm đến, chuyến bay, thông tin..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={isOpen}
        />

        <div className="search-overlay__results">
          {query && filtered.length === 0 && (
            <div style={{ color: '#aaa' }}>Không tìm thấy kết quả</div>
          )}
          {filtered.map((s) => (
            <div
              key={s}
              className="search-overlay__result-item"
              onClick={() => handleSelect(s)}
            >
              ✈️ {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}