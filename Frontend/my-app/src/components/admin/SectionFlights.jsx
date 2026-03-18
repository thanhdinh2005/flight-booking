import { useState, useEffect } from 'react'
import Badge from '../badge'
import Modal from '../model'
import { fmt } from './helpers'
import { flightAPI } from './adminAPI'
import { INIT_FLIGHTS } from './mockData'

const GEN_TIMES = [['06:00', '08:10'], ['10:00', '12:10'], ['14:00', '16:10'], ['18:00', '20:10']]

export function SectionFlights() {
  const [list, setList]     = useState(INIT_FLIGHTS)
  const [q, setQ]           = useState('')
  const [modal, setModal]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [gen, setGen]       = useState({ from: 'HAN', to: 'SGN', date: '2026-03-20', count: 2, price: 1200000 })

  // Pagination state
  const [page, setPage]     = useState(1)
  const [perPage]           = useState(10)
  const [total, setTotal]   = useState(0)
  const [meta, setMeta]     = useState({})

  useEffect(() => { fetchFlights(page) }, [page])

  const fetchFlights = async (currentPage = 1) => {
    setLoading(true)
    try {
      const result = await flightAPI.getPage({ page: currentPage, per_page: perPage })
      setList(result.data)
      setTotal(result.meta?.total ?? result.data.length)
      setMeta(result.meta ?? {})
      setError('')
    } catch (err) {
      console.error('[SectionFlights] fetchFlights lỗi:', err.message)
      setError('Lỗi tải chuyến bay: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = list.filter(f => {
    const search = q.toUpperCase()
    const idMatch = String(f.id ?? '').toUpperCase().includes(search)
    const fromMatch = String(f.from ?? '').toUpperCase().includes(search)
    const toMatch = String(f.to ?? '').toUpperCase().includes(search)
    const flightNumMatch = String(f.flight_number ?? '').toUpperCase().includes(search)
    return idMatch || fromMatch || toMatch || flightNumMatch
  })

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await flightAPI.generate({
        from: gen.from, to: gen.to, date: gen.date,
        count: +gen.count, price: +gen.price
      })
      console.log('%c[flightAPI.generate] ✅', 'color:#22c55e', result)
      console.log('[SectionFlights] Created flights:', result.data)
      
      // Update total count first
      const newTotal = total + result.created
      setTotal(newTotal)
      
      // Calculate last page and jump there to show new flights
      const lastPage = Math.ceil(newTotal / perPage)
      setPage(lastPage)
      
      // Refresh the last page
      await fetchFlights(lastPage)
      
      // Show success notification
      setError('')
    } catch (err) {
      console.error('[flightAPI.generate] ❌', err)
      setError('Lỗi tạo chuyến bay: ' + err.message)
    } finally {
      setLoading(false)
      setModal(false)
    }
  }

  return (
    <div className="adm-fade">
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Quản lý chuyến bay</div>
          <div className="adm-sec-sub">{total} chuyến | Trang {page}/{meta.last_page ?? Math.ceil(total/perPage)}</div>
        </div>
        <div className="adm-row">
          <button className="adm-btn adm-btn-ghost" onClick={() => setModal(true)} disabled={loading}>
            ⚡ Sinh tự động
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '12px 16px', borderRadius: 4, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18 }} onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-toolbar">
          <input className="adm-search" placeholder="🔍 Tìm mã bay, điểm đi/đến..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Mã bay</th><th>Tuyến</th><th>Ngày</th><th>Giờ đi</th>
                <th>Giờ đến</th><th>Chỗ trống</th><th>Giá vé</th><th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="adm-empty">{loading ? '⏳ Đang tải...' : 'Không tìm thấy'}</div></td></tr>
              ) : filtered.map(f => (
                <tr key={f.id}>
                  <td><span style={{ fontFamily: 'DM Mono', color: 'var(--accent2)', fontWeight: 600 }}>{f.flight_number || f.id}</span></td>
                  <td><b>{f.from}</b><span style={{ color: 'var(--text-dim)', margin: '0 5px' }}>→</span><b>{f.to}</b></td>
                  <td><span className="adm-mono">{f.date}</span></td>
                  <td><span className="adm-mono">{f.dep}</span></td>
                  <td><span className="adm-mono">{f.arr}</span></td>
                  <td><span style={{ color: f.sold === f.seats ? 'var(--danger)' : 'inherit' }}>{f.sold}/{f.seats}</span></td>
                  <td><span className="adm-mono" style={{ color: 'var(--accent)' }}>{f.price ? fmt(f.price) : '—'}</span></td>
                  <td><Badge value={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {meta.last_page > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '16px', borderTop: '1px solid var(--border)' }}>
            <button 
              className="adm-btn adm-btn-ghost" 
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => p - 1)}
            >← Trước</button>
            
            {Array.from({ length: meta.last_page ?? 1 }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className="adm-btn"
                style={{ 
                  minWidth: 36, 
                  background: p === page ? 'var(--accent)' : 'var(--surface)',
                  color: p === page ? 'white' : 'var(--text)'
                }}
                onClick={() => setPage(p)}
                disabled={loading}
              >
                {p}
              </button>
            ))}
            
            <button 
              className="adm-btn adm-btn-ghost" 
              disabled={page >= (meta.last_page ?? 1) || loading}
              onClick={() => setPage(p => p + 1)}
            >Sau →</button>
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Sinh chuyến bay tự động" sub="Tạo nhiều chuyến theo lịch" onClose={() => setModal(false)}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)} disabled={loading}>Hủy</button>
              <button className="adm-btn adm-btn-primary" onClick={generate} disabled={loading}>
                {loading ? '⏳ Đang tạo...' : 'Tạo chuyến bay'}
              </button>
            </>
          }>
          <div className="adm-2col">
            {[['from', 'Điểm đi', 'HAN'], ['to', 'Điểm đến', 'SGN']].map(([k, l, p]) => (
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