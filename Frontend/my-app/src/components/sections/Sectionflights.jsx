import { useState, useEffect } from 'react'
import Badge from '../badge'
import Modal from '../model'
import api from './api'
import { Spinner, ErrBox, fmt } from './Shared'

/* ════════════════════════════════════════════
   SECTION: FLIGHTS
   API: GET /admin/flights, POST /admin/flights
════════════════════════════════════════════ */
export function SectionFlights() {
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({
    flight_number: '', from: '', to: '',
    departure_time: '', arrival_time: '', seats: 180, price: '',
  })

  /* ── Load flights ── */
  const loadFlights = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await api.getAllFlights()
      setList(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFlights() }, [])

  /* ── Create manual flight ── */
  const handleCreate = async () => {
    setError('')
    setLoading(true)
    try {
      const newFlight = await api.createFlight(form)
      setList(l => [...l, newFlight])
      setModal(false)
      setForm({ flight_number: '', from: '', to: '', departure_time: '', arrival_time: '', seats: 180, price: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = list.filter(f =>
    !search ||
    (f.flight_number || f.id || '').toString().toUpperCase().includes(search.toUpperCase()) ||
    (f.from || '').toUpperCase().includes(search.toUpperCase()) ||
    (f.to   || '').toUpperCase().includes(search.toUpperCase())
  )

  return (
    <div className="adm-fade">
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Quản lý chuyến bay</div>
          <div className="adm-sec-sub">{list.length} chuyến bay</div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setModal(true)}>+ Tạo chuyến bay</button>
      </div>

      {error && <ErrBox msg={error} onRetry={loadFlights} />}

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="🔍 Tìm mã bay, điểm đi/đến..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="adm-btn adm-btn-ghost" onClick={loadFlights}>↻ Làm mới</button>
        </div>
        <div className="adm-scroll">
          {loading ? <Spinner /> : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Mã bay</th><th>Tuyến</th><th>Giờ đi</th>
                  <th>Giờ đến</th><th>Ghế</th><th>Giá</th><th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="adm-empty">Chưa có chuyến bay nào</div></td></tr>
                ) : filtered.map(f => (
                  <tr key={f.id}>
                    <td><span style={{ fontFamily: 'DM Mono', color: 'var(--accent2)', fontWeight: 600 }}>{f.flight_number || f.id}</span></td>
                    <td><b>{f.from}</b><span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>→</span><b>{f.to}</b></td>
                    <td><span className="adm-mono">{f.departure_time}</span></td>
                    <td><span className="adm-mono">{f.arrival_time}</span></td>
                    <td>{f.seats}</td>
                    <td><span className="adm-mono" style={{ color: 'var(--accent)' }}>{f.price ? fmt(f.price) : '—'}</span></td>
                    <td><Badge value={f.status || 'scheduled'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal tạo chuyến bay thủ công */}
      {modal && (
        <Modal
          title="Tạo chuyến bay thủ công"
          sub="POST /admin/flights"
          onClose={() => setModal(false)}
          footer={<>
            <button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)}>Hủy</button>
            <button className="adm-btn adm-btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo chuyến bay'}
            </button>
          </>}
        >
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Mã chuyến bay</label>
              <input className="adm-input" placeholder="VN201"
                value={form.flight_number} onChange={e => setForm(f => ({ ...f, flight_number: e.target.value }))} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Số ghế</label>
              <input className="adm-input" type="number" value={form.seats}
                onChange={e => setForm(f => ({ ...f, seats: e.target.value }))} />
            </div>
          </div>
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Điểm đi</label>
              <input className="adm-input" placeholder="HAN"
                value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value.toUpperCase() }))} maxLength={3} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Điểm đến</label>
              <input className="adm-input" placeholder="SGN"
                value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value.toUpperCase() }))} maxLength={3} />
            </div>
          </div>
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Giờ khởi hành</label>
              <input className="adm-input" type="datetime-local"
                value={form.departure_time} onChange={e => setForm(f => ({ ...f, departure_time: e.target.value }))} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Giờ đến</label>
              <input className="adm-input" type="datetime-local"
                value={form.arrival_time} onChange={e => setForm(f => ({ ...f, arrival_time: e.target.value }))} />
            </div>
          </div>
          <div className="adm-field">
            <label className="adm-label">Giá vé (VNĐ)</label>
            <input className="adm-input" type="number" placeholder="1200000"
              value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          </div>
          {error && <ErrBox msg={error} />}
        </Modal>
      )}
    </div>
  )
}