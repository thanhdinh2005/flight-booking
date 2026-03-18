// src/components/Sidebar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import MyTicket from './Myticker';
import CancelTicket from './Cancelticker';
import ChangeFlight from './Changeflight';
import khamPhaIcon   from '../assets/khám phá.png';
import muaVeIcon     from '../assets/mua vé.png';
import diaDiemIcon   from '../assets/địa điểm.png';
import hoaDonIcon    from '../assets/hóa đơn.png';
import troGiupIcon   from '../assets/trợ giúp.png';

const NAV_ITEMS = [
  { id: 'khampha',    icon: khamPhaIcon,   label: 'Khám phá',           route: '/home ' },
  { id: 'muave',      icon: muaVeIcon,     label: 'Mua vé & Dịch vụ',  route: null },  // mở modal
  { id: 'trainghiem', icon: hoaDonIcon,    label: 'Trải nghiệm bay',    route: '/experience' },
  { id: 'trogiup',    icon: troGiupIcon,   label: 'Trợ giúp',           route: '/help' },
];

// Các chức năng trong modal "Mua vé & Dịch vụ"
const SERVICE_OPTIONS = [
  {
    id: 'buy',
    icon: '🛫',
    title: 'Lịch sử Mua vé',
    desc: 'Xem lại lịch sử mua vé và dịch vụ của bạn',
    route: '/buy-ticket',
    color: '#f5a623',
  },
  {
    id: 'cancel',
    icon: '🚫',
    title: 'Hủy vé',
    desc: 'Kiểm tra điều kiện hoàn tiền và hủy vé',
    route: '/cancel-ticket',
    color: '#ef4444',
  },
  {
    id: 'change',
    icon: '🔄',
    title: 'Đổi chuyến bay',
    desc: 'Đổi sang chuyến bay khác trong 1 tuần tới',
    route: '/change-flight',
    color: '#3b82f6',
  },
];

export default function Sidebar({ activeId = 'khampha', onSelect }) {
  const navigate  = useNavigate();
  const [expanded,      setExpanded]      = useState(false);
  const [serviceModal,  setServiceModal]  = useState(false);

  function handleItemClick(item) {
    if (item.id === 'muave') {
      activeId = 'muave';
      setServiceModal(true);
      return;
    }
    if(item.id ==='khampha')
    {      navigate(`/home`);
    }
    onSelect?.(item.id);
    if (item.route) navigate(item.route);
  }

  function handleServiceSelect(svc) {
    setServiceModal(false);
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
                  className="svc-card"
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