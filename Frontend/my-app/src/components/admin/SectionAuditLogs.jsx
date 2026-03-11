import { useState } from 'react'
import Badge from '../badge'
import { INIT_LOGS } from './mockData'

const LOG_TYPES    = ['all','create','book','update','refund','cancel','delete']
const LOG_TYPE_LBL = { all:'Tất cả', create:'Tạo', book:'Đặt vé', update:'Sửa', refund:'Hoàn', cancel:'Hủy', delete:'Xóa' }

export function SectionAuditLogs() {
  const [q, setQ]       = useState('')
  const [type, setType] = useState('all')

  const filtered = INIT_LOGS.filter(l =>
    (l.user.includes(q) || l.action.toLowerCase().includes(q.toLowerCase())) &&
    (type === 'all' || l.type === type)
  )

  return (
    <div className="adm-fade">
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Truy vết hành động</div>
          <div className="adm-sec-sub">Lịch sử hoạt động người dùng &amp; admin</div>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar" style={{ flexDirection:'column', alignItems:'flex-start', gap:8 }}>
          <input className="adm-search" style={{ width:'100%' }} placeholder="🔍 Người dùng, hành động..."
            value={q} onChange={e => setQ(e.target.value)} />
          <div className="adm-chips">
            {LOG_TYPES.map(t => (
              <div key={t} className={`adm-chip ${type === t ? 'on' : ''}`} onClick={() => setType(t)}>
                {LOG_TYPE_LBL[t]}
              </div>
            ))}
          </div>
        </div>
        <div className="adm-scroll">
          <table className="adm-table">
            <thead><tr>
              <th>#</th><th>Người dùng</th><th>Hành động</th><th>Đối tượng</th><th>Thời gian</th><th>IP</th><th>Loại</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7}><div className="adm-empty">Không có log</div></td></tr>
                : filtered.map(l => (
                  <tr key={l.id}>
                    <td><span className="adm-mono" style={{ color:'var(--text-dim)' }}>{l.id}</span></td>
                    <td><span className="adm-mono" style={{ color: l.user.includes('admin') ? 'var(--accent)' : 'var(--text)' }}>{l.user}</span></td>
                    <td style={{ maxWidth:240 }}>{l.action}</td>
                    <td><span className="adm-mono" style={{ color:'var(--accent2)', fontSize:11 }}>{l.target}</span></td>
                    <td><span className="adm-mono" style={{ fontSize:11 }}>{l.time}</span></td>
                    <td><span className="adm-mono" style={{ color:'var(--text-dim)', fontSize:11 }}>{l.ip}</span></td>
                    <td><Badge value={l.type} /></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
