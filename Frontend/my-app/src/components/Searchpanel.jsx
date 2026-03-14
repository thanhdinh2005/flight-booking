// src/components/SearchPanel.jsx
import { useState } from 'react';
import '../styles/SearchPanel.css';
import TabMuaVe   from './tabs/Tabmuave';
import TabThuTuc  from './tabs/Tabthutuc';
import TabQuanLy  from './tabs/Tabquanly';
import TabTraCuu  from './tabs/Tabtracuu';

const TABS = [
  { id: 'muave',    label: '✈️ Mua vé',              Component: TabMuaVe  },
  { id: 'thutuc',   label: '📄 Thủ tục',              Component: TabThuTuc },
  { id: 'quanly',   label: '📊 Quản lý chuyến bay',   Component: TabQuanLy },
  { id: 'tracuu',   label: '🔎 Tra cứu lịch bay',     Component: TabTraCuu },
];

/**
 * SearchPanel – white card with 5 service tabs.
 * Props:
 *   onAction {(message: string) => void}
 */
export default function SearchPanel({ onAction }) {
  const [activeTab, setActiveTab] = useState('muave');

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component;

  return (
    <div className="search-panel">
      {/* Tab bar */}
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {ActiveComponent && <ActiveComponent onAction={onAction} />}
    </div>
  );
}