import { fmt, fmtNum } from './helpers'
import { INIT_FLIGHTS } from './mockData'

export function SectionDashboard() {
  const STATS = { revenue: 4875000000, tickets: 2841, flights: 48, customers: 1293, refunds: 142, cancelled: 38 }
  const CARDS = [
    { label: 'Doanh thu tháng', value: fmt(STATS.revenue),      delta: '↑ 12.4% vs T2', icon: '💰', color: 'var(--accent)'  },
    { label: 'Vé đã bán',       value: fmtNum(STATS.tickets),   delta: '↑ 8.1% vs T2',  icon: '🎫', color: 'var(--accent2)' },
    { label: 'Chuyến bay',      value: STATS.flights,           delta: 'Tháng này',      icon: '✈️', color: 'var(--purple)'  },
    { label: 'Khách hàng',      value: fmtNum(STATS.customers), delta: '+47 mới',         icon: '👤', color: 'var(--accent)'  },
    { label: 'Yêu cầu hoàn',    value: STATS.refunds,           delta: 'Đang xử lý: 12', icon: '↩️', color: 'var(--warn)'    },
    { label: 'Vé đã hủy',       value: STATS.cancelled,         delta: '3 ngày qua',     icon: '❌', color: 'var(--danger)'  },
  ]
  const bars = [320,410,290,480,560,390,510], days = ['T2','T3','T4','T5','T6','T7','CN']
  const max  = Math.max(...bars)

  return (
    <div className="adm-fade">
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
        {/* Bar chart */}
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

        {/* Fill rate */}
        <div className="adm-card" style={{ padding: '18px 20px' }}>
          <div className="adm-sec-title" style={{ marginBottom: 14 }}>Tỷ lệ lấp đầy</div>
          {INIT_FLIGHTS.map(f => {
            const pct = Math.round(f.sold / f.seats * 100)
            const bc  = pct === 100 ? 'var(--danger)' : pct > 70 ? 'var(--warn)' : 'var(--accent)'
            return (
              <div key={f.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontFamily: 'DM Mono', color: 'var(--accent2)' }}>{f.id}</span>
                  <span style={{ color: 'var(--text-mid)' }}>{f.from}→{f.to}</span>
                  <span style={{ fontFamily: 'DM Mono', fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="adm-prog-wrap"><div className="adm-prog" style={{ width: `${pct}%`, background: bc }} /></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
