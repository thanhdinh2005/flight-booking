import { useState, useEffect } from 'react'
import Badge from '../badge'
import Modal from '../model'
import api from './api'
import { Spinner, ErrBox } from './Shared'

/* ════════════════════════════════════════════
   SECTION: SCHEDULES
   API: GET /admin/schedules, POST, PUT reactivate, PUT phase-out
════════════════════════════════════════════ */
export function SectionSchedules() {
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ flight_id: '', date: '', repeat_days: '' })

  const loadSchedules = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await api.getAllSchedules()
      setList(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSchedules() }, [])

  /* ── Reactivate schedule ── */
  const handleReactivate = async (id) => {
    setError('')
    setActionLoading(id + '_react')
    try {
      await api.reactivateSchedule(id)
      setList(l => l.map(s => s.id === id ? { ...s, status: 'active' } : s))
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading('')
    }
  }

  /* ── Phase-out schedule ── */
  const handlePhaseOut = async (id) => {
    setError('')
    setActionLoading(id + '_phase')
    try {
      await api.phaseOutSchedule(id)
      setList(l => l.map(s => s.id === id ? { ...s, status: 'phased_out' } : s))
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading('')
    }
  }

  /* ── Create schedule ── */
  const handleCreate = async () => {
    setError('')
    setLoading(true)
    try {
      const created = await api.createSchedule(form)
      setList(l => [...l, created])
      setModal(false)
      setForm({ flight_id: '', date: '', repeat_days: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="adm-fade">
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Lịch trình chuyến bay</div>
          <div className="adm-sec-sub">{list.length} lịch trình</div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setModal(true)}>+ Tạo lịch trình</button>
      </div>

      {error && <ErrBox msg={error} onRetry={loadSchedules} />}

      <div className="adm-card">
        <div className="adm-toolbar">
          <button className="adm-btn adm-btn-ghost" onClick={loadSchedules}>↻ Làm mới</button>
        </div>
        <div className="adm-scroll">
          {loading ? <Spinner /> : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th><th>Chuyến bay</th><th>Ngày</th>
                  <th>Lặp lại</th><th>Trạng thái</th><th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={6}><div className="adm-empty">Chưa có lịch trình</div></td></tr>
                ) : list.map(s => (
                  <tr key={s.id}>
                    <td><span className="adm-mono">{s.id}</span></td>
                    <td><span style={{ fontFamily: 'DM Mono', color: 'var(--accent2)' }}>{s.flight_id || s.flight?.flight_number || '—'}</span></td>
                    <td><span className="adm-mono">{s.date}</span></td>
                    <td>{s.repeat_days || '—'}</td>
                    <td><Badge value={s.status || 'scheduled'} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="adm-btn adm-btn-ghost adm-btn-sm"
                          disabled={actionLoading === s.id + '_react'}
                          onClick={() => handleReactivate(s.id)}
                        >
                          {actionLoading === s.id + '_react' ? '...' : '▶ Kích hoạt'}
                        </button>
                        <button
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          disabled={actionLoading === s.id + '_phase'}
                          onClick={() => handlePhaseOut(s.id)}
                        >
                          {actionLoading === s.id + '_phase' ? '...' : '⏸ Phase-out'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <Modal
          title="Tạo lịch trình"
          sub="POST /admin/schedules"
          onClose={() => setModal(false)}
          footer={<>
            <button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)}>Hủy</button>
            <button className="adm-btn adm-btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo lịch trình'}
            </button>
          </>}
        >
          <div className="adm-field">
            <label className="adm-label">ID Chuyến bay</label>
            <input className="adm-input" placeholder="Nhập flight_id..."
              value={form.flight_id} onChange={e => setForm(f => ({ ...f, flight_id: e.target.value }))} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Ngày bay</label>
            <input className="adm-input" type="date"
              value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Lặp lại (vd: Mon,Wed,Fri)</label>
            <input className="adm-input" placeholder="Mon,Wed,Fri"
              value={form.repeat_days} onChange={e => setForm(f => ({ ...f, repeat_days: e.target.value }))} />
          </div>
          {error && <ErrBox msg={error} />}
        </Modal>
      )}
    </div>
  )
}