// src/components/Topbar.jsx
import '../styles/Topbar.css';
import timkiem from '../assets/tìm kiếm.png';
import avata from '../assets/avata.png';

export default function Topbar({ onSearchOpen, onLoginClick }) {
  return (
    <header className="topbar">
      <a className="topbar__logo" href="/">
        <span className="topbar__logo-icon">✈️</span>
        <span className="topbar__logo-text">Việt Jett</span>
      </a>

      <div className="topbar__actions">
        <button
          className="btn-icon"
          title="Tìm kiếm"
          onClick={onSearchOpen}
          type="button"
        >
          <img src={timkiem} alt="Tìm kiếm" />
        </button>
        <button
          className="btn-icon"
          title="Tài khoản"
          onClick={onLoginClick}
          type="button"
        >
          <img src={avata} alt="Tài khoản" />
        </button>
      </div>
    </header>
  );
}