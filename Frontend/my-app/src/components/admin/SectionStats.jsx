import { fmt } from './helpers'
import { TOP_ROUTES } from './mockData'

export function SectionStats() {
  return (
    <div className="adm-fade">
      <div className="adm-sec-header">
        <div><div className="adm-sec-title">Thống kê</div><div className="adm-sec-sub">Tháng 3 / 2026</div></div>
      </div>

      <div className="adm-stat-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)', marginBottom: 20 }}>
        {[
          { label: 'Tổng doanh thu', value: fmt(4875000000), color: 'var(--accent)'  },
          { label: 'Tỷ lệ lấp đầy', value: '78.4%',         color: 'var(--accent2)' },
          { label: 'Vé hoàn trả',    value: 142,             color: 'var(--warn)'    },
          { label: 'Vé đã hủy',      value: 38,              color: 'var(--danger)'  },
        ].map((s,i) => (
          <div className="adm-stat-card" key={i} style={{ '--card-color': s.color }}>
            <div className="adm-stat-label">{s.label}</div>
            <div className="adm-stat-val" style={{ fontSize: 30 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="adm-card" style={{ padding: 20 }}>
        <div className="adm-sec-title" style={{ marginBottom: 16 }}>Tuyến bay phổ biến</div>
        {TOP_ROUTES.map((r,i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
              <span style={{ fontWeight:600 }}>{r.route}</span>
              <div style={{ display:'flex', gap:16 }}>
                <span style={{ fontFamily:'DM Mono', color:'var(--accent)' }}>{fmt(r.rev)}</span>
                <span style={{ fontFamily:'DM Mono', fontWeight:700 }}>{r.pct}%</span>
              </div>
            </div>
            <div className="adm-prog-wrap" style={{ height:7 }}>
              <div className="adm-prog" style={{ width:`${r.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
