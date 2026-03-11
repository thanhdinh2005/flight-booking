import { useState } from 'react'
import Badge from '../badge'
import Modal from '../model'
import { fmt } from './helpers'
import { INIT_TICKETS } from './mockData'

const TICKET_STATUSES = ['all','confirmed','refunded','cancelled']
const STATUS_LABEL_MAP = { all: 'Tất cả', confirmed: 'Xác nhận', refunded: 'Đã hoàn', cancelled: 'Đã hủy' }

export function SectionTickets() {
  const [list, setList]   = useState(INIT_TICKETS)
  const [q, setQ]         = useState('')
  const [filter, setFil]  = useState('all')
  const [action, setAct]  = useState(null)

  const filtered = list.filter(t => {
    const mq = t.id.includes(q) || t.customer.toLowerCase().includes(q.toLowerCase()) || t.flight.includes(q.toUpperCase())
    const ms = filter === 'all' || t.status === filter
    return mq && ms
  })

  const doAction = (id, status) => { setList(l => l.map(t => t.id === id ? { ...t, status } : t)); setAct(null) }

  const ACT = { exchange: 'Đổi vé', refund: 'Hoàn vé', cancel: 'Hủy vé' }

  return (
    <div className="adm-fade">
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Quản lý vé</div>
          <div className="adm-sec-sub">Hoàn vé · Đổi vé · Hủy vé</div>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <input className="adm-search" style={{ width: '100%' }} placeholder="🔍 Mã vé, khách hàng, chuyến bay..."
            value={q} onChange={e => setQ(e.target.value)} />
          <div className="adm-chips">
            {TICKET_STATUSES.map(s => (
              <div key={s} className={`adm-chip ${filter === s ? 'on' : ''}`} onClick={() => setFil(s)}>
                {STATUS_LABEL_MAP[s]}
              </div>
            ))}
          </div>
        </div>
        <div className="adm-scroll">
          <table className="adm-table">
            <thead><tr>
              <th>Mã vé</th><th>Khách hàng</th><th>Chuyến</th><th>Ghế</th>
              <th>Hạng</th><th>Giá</th><th>Trạng thái</th><th>Ngày phát</th><th>Hành động</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9}><div className="adm-empty">Không tìm thấy vé</div></td></tr>
                : filtered.map(t => (
                  <tr key={t.id}>
                    <td><span style={{ fontFamily: 'DM Mono', color: 'var(--accent2)' }}>{t.id}</span></td>
                    <td>{t.customer}</td>
                    <td><span style={{ fontFamily: 'DM Mono', fontWeight: 600 }}>{t.flight}</span></td>
                    <td><span className="adm-mono">{t.seat}</span></td>
                    <td>{t.class}</td>
                    <td><span className="adm-mono" style={{ color: 'var(--accent)' }}>{fmt(t.price)}</span></td>
                    <td><Badge value={t.status} /></td>
                    <td><span className="adm-mono">{t.issued}</span></td>
                    <td>
                      {t.status === 'confirmed'
                        ? <div style={{ display: 'flex', gap: 5 }}>
                            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setAct({ ticket: t, type: 'exchange' })}>Đổi</button>
                            <button className="adm-btn adm-btn-sm" style={{ color:'var(--warn)', borderColor:'rgba(245,158,11,.3)' }}
                              onClick={() => setAct({ ticket: t, type: 'refund' })}>Hoàn</button>
                            <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setAct({ ticket: t, type: 'cancel' })}>Hủy</button>
                          </div>
                        : <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>—</span>
                      }
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {action && (
        <Modal title={ACT[action.type]} sub={`Vé ${action.ticket.id} · ${action.ticket.customer}`}
          onClose={() => setAct(null)}
          footer={<>
            <button className="adm-btn adm-btn-ghost" onClick={() => setAct(null)}>Không</button>
            <button className={`adm-btn ${action.type === 'exchange' ? 'adm-btn-primary' : 'adm-btn-danger'}`}
              onClick={() => doAction(action.ticket.id, action.type === 'refund' ? 'refunded' : 'cancelled')}>
              Xác nhận {ACT[action.type]}
            </button>
          </>}>
          {action.type === 'exchange' ? (
            <>
              <div style={{ padding: 12, background: 'var(--surface2)', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                Chuyến hiện tại: <b>{action.ticket.flight}</b> · Ghế: <b>{action.ticket.seat}</b>
              </div>
              <div className="adm-field"><label className="adm-label">Chuyến bay mới</label><input className="adm-input" placeholder="VN..." /></div>
              <div className="adm-field"><label className="adm-label">Ghế mới</label><input className="adm-input" placeholder="14B" /></div>
            </>
          ) : (
            <div style={{ padding: '12px 14px', background: 'rgba(255,92,92,.06)', border: '1px solid rgba(255,92,92,.2)', borderRadius: 8, fontSize: 13 }}>
              <p>⚠️ Không thể hoàn tác. Bạn chắc muốn {action.type === 'refund' ? 'hoàn' : 'hủy'} vé <b>{action.ticket.id}</b>?</p>
              {action.type === 'refund' && <p style={{ marginTop: 8, color: 'var(--warn)' }}>Hoàn tiền: <b>{fmt(action.ticket.price)}</b></p>}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
