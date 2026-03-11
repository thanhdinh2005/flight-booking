import { useState } from 'react'
import Badge from '../badge'
import Modal from '../model'
import { fmt } from './helpers'
import { INIT_FLIGHTS } from './mockData'

const GEN_TIMES = [['06:00','08:10'],['10:00','12:10'],['14:00','16:10'],['18:00','20:10']]

export function SectionFlights() {
  const [list, setList]   = useState(INIT_FLIGHTS)
  const [q, setQ]         = useState('')
  const [modal, setModal] = useState(false)
  const [gen, setGen]     = useState({ from: 'HAN', to: 'SGN', date: '2026-03-20', count: 2, price: 1200000 })

  const filtered = list.filter(f => f.id.includes(q.toUpperCase()) || f.from.includes(q.toUpperCase()) || f.to.includes(q.toUpperCase()))

  const generate = () => {
    const news = Array.from({ length: +gen.count }, (_, i) => {
      const [dep, arr] = GEN_TIMES[i % 4]
      return { id: 'VN' + (700 + list.length + i), from: gen.from, to: gen.to,
        dep, arr, date: gen.date, seats: 180, sold: 0, price: +gen.price, status: 'scheduled' }
    })
    setList(l => [...l, ...news]); setModal(false)
  }

  return (
    <div className="adm-fade">
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Quản lý chuyến bay</div>
          <div className="adm-sec-sub">{list.length} chuyến</div>
        </div>
        <div className="adm-row">
          <button className="adm-btn adm-btn-ghost" onClick={() => setModal(true)}>⚡ Sinh tự động</button>
          <button className="adm-btn adm-btn-primary">+ Thêm chuyến</button>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input className="adm-search" placeholder="🔍 Tìm mã bay, điểm đi/đến..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="adm-scroll">
          <table className="adm-table">
            <thead><tr>
              <th>Mã bay</th><th>Tuyến</th><th>Ngày</th><th>Giờ đi</th>
              <th>Giờ đến</th><th>Chỗ trống</th><th>Giá vé</th><th>Trạng thái</th>
            </tr></thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td><span style={{ fontFamily: 'DM Mono', color: 'var(--accent2)', fontWeight: 600 }}>{f.id}</span></td>
                  <td><b>{f.from}</b><span style={{ color: 'var(--text-dim)', margin: '0 5px' }}>→</span><b>{f.to}</b></td>
                  <td><span className="adm-mono">{f.date}</span></td>
                  <td><span className="adm-mono">{f.dep}</span></td>
                  <td><span className="adm-mono">{f.arr}</span></td>
                  <td><span style={{ color: f.sold === f.seats ? 'var(--danger)' : 'inherit' }}>{f.sold}/{f.seats}</span></td>
                  <td><span className="adm-mono" style={{ color: 'var(--accent)' }}>{fmt(f.price)}</span></td>
                  <td><Badge value={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title="Sinh chuyến bay tự động" sub="Tạo nhiều chuyến theo lịch" onClose={() => setModal(false)}
          footer={<><button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)}>Hủy</button>
            <button className="adm-btn adm-btn-primary" onClick={generate}>Tạo chuyến bay</button></>}>
          <div className="adm-2col">
            {[['from','Điểm đi','HAN'],['to','Điểm đến','SGN']].map(([k,l,p]) => (
              <div className="adm-field" key={k}>
                <label className="adm-label">{l}</label>
                <input className="adm-input" value={gen[k]} maxLength={3}
                  onChange={e => setGen(g => ({ ...g, [k]: e.target.value.toUpperCase() }))} placeholder={p} />
              </div>
            ))}
          </div>
          <div className="adm-field">
            <label className="adm-label">Ngày bay</label>
            <input className="adm-input" type="date" value={gen.date} onChange={e => setGen(g => ({ ...g, date: e.target.value }))} />
          </div>
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Số chuyến (1–4)</label>
              <input className="adm-input" type="number" min={1} max={4} value={gen.count}
                onChange={e => setGen(g => ({ ...g, count: e.target.value }))} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Giá cơ bản (VNĐ)</label>
              <input className="adm-input" type="number" value={gen.price}
                onChange={e => setGen(g => ({ ...g, price: e.target.value }))} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
