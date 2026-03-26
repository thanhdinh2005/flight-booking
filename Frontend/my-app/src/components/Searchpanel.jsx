// src/components/SearchPanel.jsx
import { useState, useEffect } from 'react';
import '../styles/SearchPanel.css';
import TabMuaVe   from './tabs/Tabmuave';
import TabThuTuc  from './tabs/Tabthutuc';

import TabTraCuu  from './tabs/Tabtracuu';

const TABS = [
  { id: 'muave',    label: '✈️ Mua vé',              Component: TabMuaVe  },
  { id: 'thutuc',   label: '📄 Thủ tục',              Component: TabThuTuc },
 
  { id: 'tracuu',   label: '🔎 Tra cứu lịch bay',     Component: TabTraCuu },
];

/**
 * SearchPanel – white card with 4 service tabs.
 * Props:
 *   onAction {(message: string) => void}
 *   activeTab {string} - controlled active tab id
 *   onTabChange {(tabId: string) => void} - callback when tab changes
 *   initialDestination {{from: string, to: string}} - preset destination for TabMuaVe
 */
export default function SearchPanel({ onAction, activeTab: controlledTab, onTabChange, initialDestination }) {
  const [internalTab, setInternalTab] = useState('muave');
  
  // Use controlled tab if provided, otherwise internal
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = onTabChange ?? setInternalTab;

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

      {/* Active tab content - key forces remount when tab changes */}
      {ActiveComponent && (
        <ActiveComponent 
          key={activeTab} 
          onAction={onAction} 
          initialDestination={initialDestination}
        />
      )}
    </div>
  );
}