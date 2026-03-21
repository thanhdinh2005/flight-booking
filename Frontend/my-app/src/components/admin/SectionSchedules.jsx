import { useState, useEffect, useCallback } from 'react'
import Modal from '../model'
import { scheduleAPI } from './adminAPI'

// ─── Status badge ─────────────────────────────────────────────────────────────
function ScheduleBadge({ value }) {
  const cfg = {
    active:     { bg: 'rgba(34,197,94,.15)',  color: '#22c55e', icon: '🟢', label: 'Hoạt động' },
    phased_out: { bg: 'rgba(107,114,128,.15)', color: '#9ca3af', icon: '⏸️', label: 'Ngừng KT' },
  }
  const s = cfg[value] ?? { bg: 'rgba(107,114,128,.12)', color: '#9ca3af', icon: '•', label: value }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.icon} {s.label}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SectionSchedules() {
  const [list, setList]       = useState([])
  const [meta, setMeta]       = useState({ total: 0, last_page: 1, current_page: 1 })
  const [page, setPage]       = useState(1)
  const PER_PAGE              = 15

  const [q, setQ]             = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Modal: { type: 'reactivate'|'phase_out', item }
  const [modal, setModal]     = useState(null)

  // Create modal
  const [createModal, setCreateModal] = useState(false)
  const [createForm, setCreateForm]   = useState({ route_id: '', aircraft_id: '', departure_time: '', arrival_time: '', frequency: 'daily', valid_from: '', valid_to: '' })
  const [createErrors, setCreateErrors] = useState({})

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (p = page) => {
    setLoading(true)
    setError('')
    try {
      const res = await scheduleAPI.getAll({ page: p, per_page: PER_PAGE })
      setList(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError('Lỗi tải lịch bay: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchData(page) }, [page])

  const filtered = list.filter(s => {
    if (!q.trim()) return true
    const lower = q.toLowerCase()
    return (
      String(s.id).includes(lower) ||
      s.route.toLowerCase().includes(lower) ||
      s.from.toLowerCase().includes(lower) ||
      s.to.toLowerCase().includes(lower) ||
      s.frequency.toLowerCase().includes(lower)
    )
  })

  // ── Actions ───────────────────────────────────────────────────────────────
  const confirmAction = async () => {
    if (!modal) return
    const { type, item } = modal
    setLoading(true)
    setError('')
    try {
      if (type === 'reactivate') {
        await scheduleAPI.reactivate(item.id)
        setList(l => l.map(s => s.id === item.id ? { ...s, status: 'active' } : s))
      } else {
        await scheduleAPI.phaseOut(item.id)
        setList(l => l.map(s => s.id === item.id ? { ...s, status: 'phased_out' } : s))
      }
      setModal(null)
    } catch (err) {
      setError(`Lỗi: ` + err.message)
    } finally {
      setLoading(false)
    }
  }

  const validateCreate = (data) => {
    const e = {}
    if (!data.route_id)      e.route_id      = 'Bắt buộc'
    if (!data.aircraft_id)   e.aircraft_id   = 'Bắt buộc'
    if (!data.departure_time) e.departure_time = 'Bắt buộc'
    if (!data.valid_from)    e.valid_from    = 'Bắt buộc'
    return e
  }

  const handleCreate = async () => {
    const errors = validateCreate(createForm)
    setCreateErrors(errors)
    if (Object.keys(errors).length > 0) return
    setLoading(true)
    setError('')
    try {
      await scheduleAPI.create({
        route_id:       Number(createForm.route_id),
        aircraft_id:    Number(createForm.aircraft_id),
        departure_time: createForm.departure_time,
        arrival_time:   createForm.arrival_time || undefined,
        frequency:      createForm.frequency,
        valid_from:     createForm.valid_from,
        valid_to:       createForm.valid_to || undefined,
      })
      setCreateModal(false)
      setCreateForm({ route_id: '', aircraft_id: '', departure_time: '', arrival_time: '', frequency: 'daily', valid_from: '', valid_to: '' })
      setCreateErrors({})
      await fetchData(1)
      setPage(1)
    } catch (err) {
      setError('Lỗi tạo lịch: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = meta.last_page ?? 1
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="adm-fade">

      {/* Header */}
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Lịch bay (Schedules)</div>
          <div className="adm-sec-sub">{meta.total} lịch · Trang {page}/{totalPages}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="adm-btn adm-btn-ghost" onClick={() => fetchData(page)} disabled={loading}>🔄 Làm mới</button>
          <button
            className="adm-btn adm-btn-primary"
            onClick={() => { setCreateModal(true); setCreateErrors({}) }}
            disabled={loading}
          >
            + Tạo lịch bay
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '12px 16px', borderRadius: 4, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18 }} onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="🔍 Tuyến bay, tần suất..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tuyến bay</th>
                <th>Giờ đi</th>
                <th>Giờ đến</th>
                <th>Tần suất</th>
                <th>Máy bay</th>
                <th>Hiệu lực từ</th>
                <th>Đến ngày</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && list.length === 0 ? (
                <tr><td colSpan={10}><div className="adm-empty">⏳ Đang tải...</div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10}><div className="adm-empty">{list.length === 0 ? 'Chưa có lịch bay' : 'Không tìm thấy'}</div></td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} style={{ opacity: loading ? 0.6 : 1 }}>
                  <td><span className="adm-mono" style={{ color: 'var(--text-dim)' }}>#{s.id}</span></td>
                  <td>
                    <b style={{ color: 'var(--accent2)' }}>{s.from}</b>
                    <span style={{ color: 'var(--text-dim)', margin: '0 5px' }}>→</span>
                    <b style={{ color: 'var(--accent2)' }}>{s.to}</b>
                  </td>
                  <td><span className="adm-mono">{s.depTime || '—'}</span></td>
                  <td><span className="adm-mono">{s.arrTime || '—'}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-mid)' }}>{s.frequency || '—'}</td>
                  <td style={{ fontSize: 12 }}>{s.aircraft || '—'}</td>
                  <td><span className="adm-mono">{s.validFrom || '—'}</span></td>
                  <td><span className="adm-mono">{s.validTo || '—'}</span></td>
                  <td><ScheduleBadge value={s.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {s.status === 'phased_out' ? (
                        <button
                          className="adm-btn adm-btn-sm"
                          style={{ color: '#22c55e', borderColor: 'rgba(34,197,94,.3)', background: 'rgba(34,197,94,.08)' }}
                          disabled={loading}
                          onClick={() => setModal({ type: 'reactivate', item: s })}
                          title="Kích hoạt lại"
                        >
                          ▶ Kích hoạt
                        </button>
                      ) : (
                        <button
                          className="adm-btn adm-btn-sm"
                          style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,.3)', background: 'rgba(245,158,11,.08)' }}
                          disabled={loading}
                          onClick={() => setModal({ type: 'phase_out', item: s })}
                          title="Ngừng khai thác"
                        >
                          ⏸ Ngừng KT
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: 16, borderTop: '1px solid var(--border)' }}>
            <button className="adm-btn adm-btn-ghost" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>← Trước</button>
            {pageNumbers.map((p, idx) => (
              <>
                {idx > 0 && pageNumbers[idx - 1] !== p - 1 && (
                  <span key={`g-${p}`} style={{ alignSelf: 'center', color: 'var(--text-dim)' }}>…</span>
                )}
                <button
                  key={p}
                  className="adm-btn"
                  style={{ minWidth: 36, background: p === page ? 'var(--accent)' : 'var(--surface)', color: p === page ? 'white' : 'var(--text)' }}
                  onClick={() => setPage(p)}
                  disabled={loading}
                >
                  {p}
                </button>
              </>
            ))}
            <button className="adm-btn adm-btn-ghost" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>Sau →</button>
          </div>
        )}
      </div>

      {/* ── Modal KÍCH HOẠT ────────────────────────────────────────────────── */}
      {modal?.type === 'reactivate' && (
        <Modal
          title="Kích hoạt lại lịch bay"
          sub={`ID #${modal.item.id} · ${modal.item.route}`}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)} disabled={loading}>Hủy</button>
              <button
                className="adm-btn"
                style={{ background: '#22c55e', color: 'white', borderColor: '#22c55e' }}
                onClick={confirmAction}
                disabled={loading}
              >
                {loading ? '⏳...' : '▶ Kích hoạt lại'}
              </button>
            </>
          }
        >
          <div style={{ padding: '12px 14px', background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 8, fontSize: 13 }}>
            <p>Kích hoạt lại lịch bay <b>{modal.item.route}</b>?</p>
            <p style={{ marginTop: 8, color: 'var(--text-mid)' }}>
              Giờ đi: <b>{modal.item.depTime}</b> · Tần suất: <b>{modal.item.frequency}</b>
            </p>
          </div>
        </Modal>
      )}

      {/* ── Modal NGỪNG KHAI THÁC ─────────────────────────────────────────── */}
      {modal?.type === 'phase_out' && (
        <Modal
          title="Ngừng khai thác lịch bay"
          sub={`ID #${modal.item.id} · ${modal.item.route}`}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)} disabled={loading}>Hủy</button>
              <button className="adm-btn adm-btn-danger" onClick={confirmAction} disabled={loading}>
                {loading ? '⏳...' : '⏸ Xác nhận ngừng KT'}
              </button>
            </>
          }
        >
          <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 8, fontSize: 13 }}>
            <p>⚠️ Lịch bay <b>{modal.item.route}</b> sẽ bị ngừng khai thác.</p>
            <p style={{ marginTop: 8, color: 'var(--text-mid)' }}>
              Các chuyến bay tương lai thuộc lịch này sẽ không được tạo thêm. Vé đã bán không bị ảnh hưởng.
            </p>
          </div>
        </Modal>
      )}

      {/* ── Modal TẠO LỊCH BAY ───────────────────────────────────────────── */}
      {createModal && (
        <Modal
          title="Tạo lịch bay mới"
          sub="Nhập thông tin lịch bay"
          onClose={() => { setCreateModal(false); setCreateErrors({}) }}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => { setCreateModal(false); setCreateErrors({}) }} disabled={loading}>Hủy</button>
              <button className="adm-btn adm-btn-primary" onClick={handleCreate} disabled={loading}>
                {loading ? '⏳ Đang tạo...' : 'Tạo lịch bay'}
              </button>
            </>
          }
        >
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Route ID <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className={`adm-input ${createErrors.route_id ? 'adm-input-error' : ''}`}
                type="number" min={1} placeholder="1"
                value={createForm.route_id}
                onChange={e => setCreateForm(f => ({ ...f, route_id: e.target.value }))}
              />
              {createErrors.route_id && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{createErrors.route_id}</div>}
            </div>
            <div className="adm-field">
              <label className="adm-label">Aircraft ID <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className={`adm-input ${createErrors.aircraft_id ? 'adm-input-error' : ''}`}
                type="number" min={1} placeholder="1"
                value={createForm.aircraft_id}
                onChange={e => setCreateForm(f => ({ ...f, aircraft_id: e.target.value }))}
              />
              {createErrors.aircraft_id && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{createErrors.aircraft_id}</div>}
            </div>
          </div>
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Giờ đi <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className={`adm-input ${createErrors.departure_time ? 'adm-input-error' : ''}`}
                type="time"
                value={createForm.departure_time}
                onChange={e => setCreateForm(f => ({ ...f, departure_time: e.target.value }))}
              />
              {createErrors.departure_time && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{createErrors.departure_time}</div>}
            </div>
            <div className="adm-field">
              <label className="adm-label">Giờ đến</label>
              <input className="adm-input" type="time" value={createForm.arrival_time}
                onChange={e => setCreateForm(f => ({ ...f, arrival_time: e.target.value }))} />
            </div>
          </div>
          <div className="adm-field">
            <label className="adm-label">Tần suất</label>
            <select className="adm-input" value={createForm.frequency} onChange={e => setCreateForm(f => ({ ...f, frequency: e.target.value }))}>
              <option value="daily">Hàng ngày</option>
              <option value="weekdays">Ngày thường (T2–T6)</option>
              <option value="weekends">Cuối tuần (T7, CN)</option>
              <option value="Mon,Wed,Fri">T2, T4, T6</option>
              <option value="Tue,Thu,Sat">T3, T5, T7</option>
            </select>
          </div>
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Hiệu lực từ <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className={`adm-input ${createErrors.valid_from ? 'adm-input-error' : ''}`}
                type="date"
                value={createForm.valid_from}
                onChange={e => setCreateForm(f => ({ ...f, valid_from: e.target.value }))}
              />
              {createErrors.valid_from && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{createErrors.valid_from}</div>}
            </div>
            <div className="adm-field">
              <label className="adm-label">Đến ngày</label>
              <input className="adm-input" type="date" value={createForm.valid_to}
                onChange={e => setCreateForm(f => ({ ...f, valid_to: e.target.value }))} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}