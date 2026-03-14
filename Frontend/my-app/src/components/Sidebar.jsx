// src/components/Sidebar.jsx
import { useState } from 'react';
import '../styles/Sidebar.css';

// Import icons
import khamPhaIcon from '../assets/khám phá.png';
import muaVeIcon from '../assets/mua vé.png';
import diaDiemIcon from '../assets/địa điểm.png';
import hoaDonIcon from '../assets/hóa đơn.png';
import troGiupIcon from '../assets/trợ giúp.png';

const NAV_ITEMS = [
  { id: 'khampha',   icon: khamPhaIcon, label: 'Khám phá' },
  { id: 'muave',     icon: muaVeIcon, label: 'Mua vé & Dịch vụ' },
  { id: 'thongtin',  icon: diaDiemIcon, label: 'Thông tin chuyến bay' },
  { id: 'trainghiem',icon: hoaDonIcon, label: 'Trải nghiệm bay' },
  { id: 'trogiup',   icon: troGiupIcon, label: 'Trợ giúp' },
];

/**
 * Sidebar – collapsible left navigation.
 * Props:
 *   activeId   {string}
 *   onSelect   {(id: string) => void}
 */
export default function Sidebar({ activeId, onSelect }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav className={`sidebar ${expanded ? 'sidebar--expanded' : ''}`}>
      <button
        className="sidebar__toggle"
        onClick={() => setExpanded((p) => !p)}
        title={expanded ? 'Thu gọn' : 'Mở rộng'}
      >
        {expanded ? '‹' : '›'}
      </button>

      {NAV_ITEMS.map((item) => (
        <div
          key={item.id}
          className={`sidebar__item ${activeId === item.id ? 'sidebar__item--active' : ''}`}
          onClick={() => onSelect(item.id)}
        >
          <img src={item.icon} alt={item.label} className="sidebar__icon" />
          <span className="sidebar__label">{item.label}</span>
        </div>
      ))}
    </nav>
  );
}