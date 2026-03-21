import { useState, useEffect } from 'react'
import { fmt, fmtNum } from './helpers'
import { dashboardAPI, flightAPI } from './adminAPI'
import { INIT_FLIGHTS } from './mockData'

export function SectionDashboard() {
  const [stats,   setStats]   = useState({ revenue: 0, netRevenue: 0, totalBookings: 0, totalFlights: 0, refundedAmount: 0 })
  const [chart,   setChart]   = useState({ labels: ['T2','T3','T4','T5','T6','T7','CN'], datasets: [{ data: [320,410,290,480,560,390,510] }] })
  const [flights, setFlights] = useState(INIT_FLIGHTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      // GET /admin/dashboard/summary
      dashboardAPI.getStats().then(d => setStats(d)),
      // GET /admin/revenue-chart?start_date=&end_date= (không truyền = 7 ngày gần nhất)
      dashboardAPI.getRevenueChart().then(d => {
        if (d?.datasets?.length) setChart(d)
      }),
      // Lấy danh sách chuyến để hiển thị fill rate
      flightAPI.getAll().then(d => { if (d.length) setFlights(d) }),
    ]).finally(() => setLoading(false))
  }, [])

  // Lấy dataset đầu tiên (gross revenue) để vẽ bar chart
  const bars   = chart.datasets?.[0]?.data ?? []
  const labels = chart.labels ?? ['T2','T3','T4','T5','T6','T7','CN']
  const max    = Math.max(...bars, 1)

  const CARDS = [
    { label: 'Doanh thu tháng',  value: fmt(stats.revenue),         delta: '↑ 12.4% vs T2',  icon: '💰', color: 'var(--accent)'  },
    { label: 'Doanh thu thuần',  value: fmt(stats.netRevenue),      delta: 'Net Revenue',      icon: '💵', color: 'var(--accent2)' },
    { label: 'Chuyến bay',       value: stats.totalFlights,         delta: 'Tháng này',        icon: '✈️', color: 'var(--purple)'  },
    { label: 'Tổng booking',     value: fmtNum(stats.totalBookings),delta: 'Đặt chỗ',          icon: '🎫', color: 'var(--accent)'  },
    { label: 'Đã hoàn tiền',     value: fmt(stats.refundedAmount),  delta: 'Refunds',           icon: '↩️', color: 'var(--warn)'    },
  ]

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="adm-sec-title" style={{ margin: 0 }}>Doanh thu 7 ngày qua</div>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              {chart.datasets?.[0]?.name ?? 'Doanh thu gộp'}
            </span>
          </div>
          <div className="adm-bars">
            {bars.map((b, i) => (
              <div className="adm-bar-col" key={i}>
                <div className="adm-bar" style={{ height: `${(b / max) * 100}%` }} title={`${labels[i]}: ${fmt(b)}`} />
                <div className="adm-bar-label">{labels[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, fontFamily: 'DM Mono', color: 'var(--text-dim)' }}>
            Đơn vị: VNĐ
          </div>
        </div>

        <div className="adm-card" style={{ padding: '18px 20px' }}>
          <div className="adm-sec-title" style={{ marginBottom: 14 }}>Tỷ lệ lấp đầy</div>
          {flights.slice(0, 8).map(f => {
            const pct = f.seats > 0 ? Math.round(f.sold / f.seats * 100) : 0
            const bc  = pct >= 100 ? 'var(--danger)' : pct > 70 ? 'var(--warn)' : 'var(--accent)'
            return (
              <div key={f.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontFamily: 'DM Mono', color: 'var(--accent2)' }}>{f.flight_number || f.id}</span>
                  <span style={{ color: 'var(--text-mid)' }}>{f.from}→{f.to}</span>
                  <span style={{ fontFamily: 'DM Mono', fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="adm-prog-wrap">
                  <div className="adm-prog" style={{ width: `${pct}%`, background: bc }} />
                </div>
              </div>
            )
          })}
          {flights.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, padding: '20px 0' }}>
              Không có dữ liệu chuyến bay
            </div>
          )}
        </div>
      </div>
    </div>
  )
}