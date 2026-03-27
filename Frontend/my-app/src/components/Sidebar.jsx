// src/components/Sidebar.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

import khamPhaIcon from '../assets/khám phá.png';
import muaVeIcon   from '../assets/mua vé.png';
import hoaDonIcon  from '../assets/hóa đơn.png';
import troGiupIcon from '../assets/trợ giúp.png';

const NAV_ITEMS = [
  { id: 'khampha',    icon: khamPhaIcon, label: 'Khám phá',          route: '/home' },
  { id: 'muave',      icon: muaVeIcon,   label: 'Mua vé & Dịch vụ', route: null },   // mở modal
  { id: 'trainghiem', icon: hoaDonIcon,  label: 'Trải nghiệm bay',   route: '/experience' },
  { id: 'trogiup',    icon: troGiupIcon, label: 'Trợ giúp',          route: '/help' },
];

const SERVICE_OPTIONS = [
  {
    id: 'my-tickets',
    icon: '🎫',
    title: 'Lịch sử mua hàng',
    desc: 'Xem lại toàn bộ vé đã đặt và trạng thái chuyến bay',
    route: '/my-tickets',
    color: '#f5a623',
  },
  {
    id: 'cancel-ticket',
    icon: '🚫',
    title: 'Hoàn vé',
    desc: 'Kiểm tra điều kiện hoàn tiền và hoàn vé',
    route: '/cancel-ticket',
    color: '#ef4444',
  },
];

// Routes con thuộc nhóm "Mua vé & Dịch vụ"
const MUAVE_ROUTES = ['/my-tickets', '/cancel-ticket'];

export default function Sidebar({ onSelect }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [expanded,     setExpanded]     = useState(false);
  const [serviceModal, setServiceModal] = useState(false);

  const currentPath = location.pathname;

  // Xác định item đang active dựa theo pathname thực tế
  function getActiveId() {
    if (MUAVE_ROUTES.some(r => currentPath.startsWith(r))) return 'muave';
    if (currentPath.startsWith('/home'))       return 'khampha';
    if (currentPath.startsWith('/experience')) return 'trainghiem';
    if (currentPath.startsWith('/help'))       return 'trogiup';
    return '';
  }

  const activeId = getActiveId();

  // Service option đang active (để highlight trong modal)
  function getActiveServiceId() {
    const matched = SERVICE_OPTIONS.find(s => currentPath.startsWith(s.route));
    return matched?.id ?? null;
  }
  const activeServiceId = getActiveServiceId();

  function handleItemClick(item) {
    if (item.id === 'muave') {
      setServiceModal(true);
      return;
    }
    onSelect?.(item.id);
    if (item.route) navigate(item.route);
  }

  function handleServiceSelect(svc) {
    setServiceModal(false);
    onSelect?.(svc.id);
    navigate(svc.route);
  }

  return (
    <>
      <nav className={`sidebar${expanded ? ' sidebar--expanded' : ''}`}>
        <button
          className="sidebar__toggle"
          onClick={() => setExpanded(p => !p)}
          title={expanded ? 'Thu gọn' : 'Mở rộng'}
        >
          {expanded ? '‹' : '›'}
        </button>

        {NAV_ITEMS.map(item => {
          const isActive = activeId === item.id;
          return (
            <div
              key={item.id}
              className={`sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
              onClick={() => handleItemClick(item)}
              title={!expanded ? item.label : undefined}
            >
              <img src={item.icon} alt={item.label} className="sidebar__icon" />
              {expanded && <span className="sidebar__label">{item.label}</span>}
              {isActive && <span className="sidebar__active-dot" />}
            </div>
          );
        })}
      </nav>

      {/* ── Modal chọn dịch vụ ── */}
      {serviceModal && (
        <div className="svc-overlay" onClick={() => setServiceModal(false)}>
          <div className="svc-modal" onClick={e => e.stopPropagation()}>
            <div className="svc-modal__header">
              <h2>Chọn dịch vụ</h2>
              <button className="svc-modal__close" onClick={() => setServiceModal(false)}>✕</button>
            </div>

            <div className="svc-modal__grid">
              {SERVICE_OPTIONS.map(svc => (
                <button
                  key={svc.id}
                  className={`svc-card${activeServiceId === svc.id ? ' svc-card--active' : ''}`}
                  onClick={() => handleServiceSelect(svc)}
                  style={{ '--accent': svc.color }}
                >
                  <span className="svc-card__icon">{svc.icon}</span>
                  <span className="svc-card__title">{svc.title}</span>
                  <span className="svc-card__desc">{svc.desc}</span>
                  <span className="svc-card__arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}