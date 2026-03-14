import { useState, useEffect } from 'react'
import { fmt, fmtNum } from './helpers'
import { dashboardAPI, flightAPI } from './adminAPI'
import { INIT_FLIGHTS } from './mockData'

export function SectionDashboard() {
  const [stats, setStats]   = useState({ revenue: 0, tickets: 0, flights: 0, customers: 0, refunds: 0, cancelled: 0 })
  const [bars, setBars]     = useState([320, 410, 290, 480, 560, 390, 510])
  const [flights, setFlights] = useState(INIT_FLIGHTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats().then(setStats),
      dashboardAPI.getRevenueChart().then(d => Array.isArray(d) && d.length && setBars(d)),
      flightAPI.getAll().then(d => d.length && setFlights(d)),
    ]).finally(() => setLoading(false))
  }, [])

  const CARDS = [
    { label: 'Doanh thu tháng', value: fmt(stats.revenue),          delta: '↑ 12.4% vs T2', icon: '💰', color: 'var(--accent)'  },
    { label: 'Vé đã bán',       value: fmtNum(stats.tickets),       delta: '↑ 8.1% vs T2',  icon: '🎫', color: 'var(--accent2)' },
    { label: 'Chuyến bay',      value: stats.flights,               delta: 'Tháng này',      icon: '✈️', color: 'var(--purple)'  },
    { label: 'Khách hàng',      value: fmtNum(stats.customers),     delta: '+47 mới',         icon: '👤', color: 'var(--accent)'  },
    { label: 'Yêu cầu hoàn',    value: stats.refunds,               delta: 'Đang xử lý: 12', icon: '↩️', color: 'var(--warn)'    },
    { label: 'Vé đã hủy',       value: stats.cancelled,             delta: '3 ngày qua',     icon: '❌', color: 'var(--danger)'  },
  ]

  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const max  = Math.max(...bars, 1)

  return (
    <div className="adm-fade">
      {loading && (
        <div style={{ textAlign: 'center', padding: '8px 0 16px', color: 'var(--text-dim)', fontSize: 13 }}>
          ⏳ Đang tải dữ liệu...
        </div>
      )}

      <div className="adm-stat-grid">
        {CARDS.map(c => (
          <div className="adm-stat-card" key={c.label} style={{ '--card-color': c.color }}>
            <div className="adm-stat-icon">{c.icon}</div>
            <div className="adm-stat-label">{c.label}</div>
            <div className="adm-stat-val">{c.value}</div>
            <div className="adm-stat-delta">{c.delta}</div>
          </div>
        ))}
      </div>

      <div className="adm-2col" style={{ gap: 18 }}>
        <div className="adm-card" style={{ padding: '18px 20px' }}>
          <div className="adm-sec-title" style={{ marginBottom: 14 }}>Doanh thu 7 ngày qua</div>
          <div className="adm-bars">
            {bars.map((b, i) => (
              <div className="adm-bar-col" key={i}>
                <div className="adm-bar" style={{ height: `${(b / max) * 100}%` }} />
                <div className="adm-bar-label">{days[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, fontFamily: 'DM Mono', color: 'var(--text-dim)' }}>
            Đơn vị: triệu VNĐ
          </div>
        </div>

        <div className="adm-card" style={{ padding: '18px 20px' }}>
          <div className="adm-sec-title" style={{ marginBottom: 14 }}>Tỷ lệ lấp đầy</div>
          {flights.map(f => {
            const pct = f.seats > 0 ? Math.round(f.sold / f.seats * 100) : 0
            const bc  = pct === 100 ? 'var(--danger)' : pct > 70 ? 'var(--warn)' : 'var(--accent)'
            return (
              <div key={f.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontFamily: 'DM Mono', color: 'var(--accent2)' }}>{f.id}</span>
                  <span style={{ color: 'var(--text-mid)' }}>{f.from}→{f.to}</span>
                  <span style={{ fontFamily: 'DM Mono', fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="adm-prog-wrap">
                  <div className="adm-prog" style={{ width: `${pct}%`, background: bc }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}