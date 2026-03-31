import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../services/keycloakService'

import {
  SectionDashboard,
  SectionCustomers,
  SectionFlights,
  SectionTickets,
  SectionStats,
  SectionAuditLogs,
  SectionBookingRequests,
  SectionSchedules,
} from '../components/admin'
import '../styles/admin.css'

const NAV = [
  {
    group: 'Tổng quan',
    items: [
      { key: 'dashboard', label: 'Dashboard',      icon: '📊' },
    ],
  },
  {
    group: 'Quản lý',
    items: [
      { key: 'customers', label: 'Quản lý tài khoản', icon: '👤' },
      { key: 'flights',   label: 'Chuyến bay',        icon: '✈️' },
      { key: 'schedules', label: 'Lịch bay',          icon: '🗓️' },
      { key: 'bookings',  label: 'Yêu cầu hoàn vé',   icon: '↩️' },
      // { key: 'tickets',   label: 'Vé máy bay',     icon: '🎫' },
    ],
  },
  {
    group: 'Báo cáo',
    items: [
      { key: 'stats',     label: 'Thống kê',       icon: '📈' },
      // { key: 'logs',   label: 'Audit Logs',      icon: '📝' },
    ],
  },
]

const PAGE_META = {
  dashboard: { eyebrow: 'Tổng quan hệ thống', sub: 'Theo dõi nhanh số liệu và hoạt động vận hành' },
  customers: { eyebrow: 'Quản lý người dùng', sub: 'Xem, cập nhật và kiểm soát trạng thái tài khoản' },
  flights:   { eyebrow: 'Điều phối khai thác', sub: 'Theo dõi và cập nhật thông tin chuyến bay' },
  schedules: { eyebrow: 'Lịch vận hành', sub: 'Quản lý lịch bay theo từng chặng và giai đoạn khai thác' },
  bookings:  { eyebrow: 'Xử lý yêu cầu', sub: 'Duyệt và theo dõi các yêu cầu hoàn vé từ khách hàng' },
  tickets:   { eyebrow: 'Quản lý vé', sub: 'Tra cứu và xử lý các vé đã phát hành' },
  stats:     { eyebrow: 'Báo cáo kinh doanh', sub: 'Tổng hợp tài chính, booking và so sánh hiệu quả tuyến bay' },
  logs:      { eyebrow: 'Nhật ký hệ thống', sub: 'Theo dõi truy vết thay đổi trong hệ thống' },
}

const SECTIONS = {
  dashboard: SectionDashboard,
  customers: SectionCustomers,
  flights:   SectionFlights,
  schedules: SectionSchedules,
  bookings:  SectionBookingRequests,
  tickets:   SectionTickets,
  stats:     SectionStats,
  logs:      SectionAuditLogs,
}

export default function AdminDashboard() {
  const navigate        = useNavigate()
  const [tab, setTab]   = useState('dashboard')
  const [time, setTime] = useState(new Date().toLocaleTimeString('vi-VN'))

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('vi-VN')), 1000)
    return () => clearInterval(t)
  }, [])

  const logout = () => {
    clearToken()
    navigate('/admin/login', { replace: true })
  }

  const ActiveSection = SECTIONS[tab] || SectionDashboard
  const currentGroup = NAV.find(group => group.items.some(item => item.key === tab))?.group || 'Quản trị'
  const currentMeta = PAGE_META[tab] || PAGE_META.dashboard

  return (
    <div className="adm-root">
      <aside className="adm-sidebar">
        <div className="adm-logo">
          <div className="adm-logo-icon">✈</div>
          <div>
            <div className="adm-logo-name">VietJett</div>
            <div className="adm-logo-tag">Admin Dashboard</div>
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
          <div className="adm-topbar-context">
            <div className="adm-topbar-eyebrow">{currentMeta.eyebrow}</div>
            <div className="adm-topbar-sub">{currentMeta.sub}</div>
          </div>
          <div className="adm-topbar-badge">{currentGroup}</div>
          <div className="adm-topbar-time">🕐 {time}</div>
        </div>
        <div className="adm-content">
          <ActiveSection />
        </div>
      </main>
    </div>
  )
}
