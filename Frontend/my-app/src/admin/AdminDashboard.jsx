import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../services/keycloakService'

import { SectionCustomers, SectionFlights, SectionSchedules, SectionRefunds } from '../components/sections'
import '../styles/admin.css'

const NAV = [
  {
    group: 'Quản lý',
    items: [
      { key: 'customers', label: 'Khách hàng',   icon: '👤' },
      { key: 'flights',   label: 'Chuyến bay',    icon: '✈️' },
      { key: 'schedules', label: 'Lịch trình',    icon: '📅' },
      { key: 'refunds',   label: 'Yêu cầu hoàn', icon: '↩️' },
    ],
  },
]

const PAGE_TITLE = {
  customers: 'Quản lý khách hàng',
  flights:   'Quản lý chuyến bay',
  schedules: 'Lịch trình chuyến bay',
  refunds:   'Yêu cầu hoàn vé',
}

const SECTIONS = {
  customers: SectionCustomers,
  flights:   SectionFlights,
  schedules: SectionSchedules,
  refunds:   SectionRefunds,
}

export default function AdminDashboard() {
  const navigate        = useNavigate()
  const [tab, setTab]   = useState('customers')
  const [time, setTime] = useState(new Date().toLocaleTimeString('vi-VN'))

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('vi-VN')), 1000)
    return () => clearInterval(t)
  }, [])

  const logout = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  const ActiveSection = SECTIONS[tab] || SectionCustomers

  return (
    <div className="adm-root">
      <aside className="adm-sidebar">
        <div className="adm-logo">
          <div className="adm-logo-icon">✈</div>
          <div>
            <div className="adm-logo-name">Whisper</div>
            <div className="adm-logo-tag">Admin Portal</div>
          </div>
        </div>

        <nav className="adm-nav">
          {NAV.map(group => (
            <div key={group.group}>
              <div className="adm-nav-group">{group.group}</div>
              {group.items.map(item => (
                <div
                  key={item.key}
                  className={`adm-nav-item ${tab === item.key ? 'active' : ''}`}
                  onClick={() => setTab(item.key)}
                >
                  <span className="adm-nav-icon">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          <div className="adm-user-chip">
            <div className="adm-avatar">A</div>
            <div>
              <div className="adm-user-name">Admin</div>
              <div className="adm-user-role">SUPER_ADMIN</div>
            </div>
          </div>
          <button className="adm-logout" onClick={logout}>⎋ Đăng xuất</button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-topbar">
          <div className="adm-topbar-title">{PAGE_TITLE[tab]}</div>
          <div className="adm-topbar-time">🕐 {time}</div>
        </div>
        <div className="adm-content">
          <ActiveSection />
        </div>
      </main>
    </div>
  )
}