import { useState, useEffect, useCallback } from 'react'
import Modal from '../model'
import { scheduleAPI } from './adminAPI'
import { getToken, isTokenExpired } from '../../services/keycloakService'

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api'

function toApiTime(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  return /^\d{2}:\d{2}$/.test(raw) ? `${raw}:00` : raw
}

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
  const DAY_OPTIONS = [
    { value: 1, label: 'T2' },
    { value: 2, label: 'T3' },
    { value: 3, label: 'T4' },
    { value: 4, label: 'T5' },
    { value: 5, label: 'T6' },
    { value: 6, label: 'T7' },
    { value: 7, label: 'CN' },
  ]
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
  const [createForm, setCreateForm]   = useState({ from_airport: '', to_airport: '', route_id: '', flight_number: '', departure_time: '', days_of_week: [1], aircraft_id: '' })
  const [createErrors, setCreateErrors] = useState({})
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [routeOptions, setRouteOptions] = useState([])
  const [aircraftOptions, setAircraftOptions] = useState([])

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

  const fetchRouteOptions = useCallback(async () => {
    setLookupLoading(true)
    setLookupError('')
    try {
      const token = getToken()
      if (!token || isTokenExpired()) throw new Error('Phiên đăng nhập admin đã hết hạn')
      const res = await fetch(`${API_BASE}/admin/routes`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)
      const routes = Array.isArray(data) ? data : (data.data ?? [])
      setRouteOptions(routes.map(route => ({
        route_id: route.id,
        from: route.origin?.code ?? '',
        fromCity: route.origin?.city ?? '',
        to: route.destination?.code ?? '',
        toCity: route.destination?.city ?? '',
      })))
    } catch (err) {
      setLookupError(err.message || 'Không tải được danh sách tuyến bay')
    } finally {
      setLookupLoading(false)
    }
  }, [])

  const fetchAircraftOptions = useCallback(async () => {
    setLookupLoading(true)
    setLookupError('')
    try {
      const token = getToken()
      if (!token || isTokenExpired()) throw new Error('Phiên đăng nhập admin đã hết hạn')
      const res = await fetch(`${API_BASE}/admin/aircraft`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)
      setAircraftOptions(Array.isArray(data) ? data : (data.data ?? []))
    } catch (err) {
      setLookupError(err.message || 'Không tải được danh sách máy bay')
    } finally {
      setLookupLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!createModal) return
    if (routeOptions.length === 0) fetchRouteOptions()
    if (aircraftOptions.length === 0) fetchAircraftOptions()
  }, [createModal, routeOptions.length, aircraftOptions.length, fetchRouteOptions, fetchAircraftOptions])

  useEffect(() => {
    const matchedRoute = routeOptions.find(route =>
      route.from === createForm.from_airport && route.to === createForm.to_airport
    )

    const loadRouteDetail = async () => {
      const nextRouteId = matchedRoute?.route_id ? String(matchedRoute.route_id) : ''
      if (!nextRouteId) {
        setCreateForm(prev => prev.route_id ? { ...prev, route_id: '' } : prev)
        return
      }

      try {
        const token = getToken()
        if (!token || isTokenExpired()) throw new Error('Phiên đăng nhập admin đã hết hạn')
        const res = await fetch(`${API_BASE}/admin/routes/${nextRouteId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)
        const routeId = data?.data?.id ? String(data.data.id) : nextRouteId
        setCreateForm(prev => prev.route_id === routeId ? prev : { ...prev, route_id: routeId })
      } catch (err) {
        setLookupError(err.message || 'Không lấy được chi tiết tuyến bay')
      }
    }

    loadRouteDetail()
  }, [createForm.from_airport, createForm.to_airport, routeOptions])

  const filtered = list.filter(s => {
    if (!q.trim()) return true
    const lower = q.toLowerCase()
    return (
      String(s.id).includes(lower) ||
      String(s.flightNumber ?? '').toLowerCase().includes(lower) ||
      s.route.toLowerCase().includes(lower) ||
      s.from.toLowerCase().includes(lower) ||
      s.to.toLowerCase().includes(lower) ||
      s.frequency.toLowerCase().includes(lower) ||
      String(s.registrationNumber ?? '').toLowerCase().includes(lower)
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
    if (!data.from_airport)  e.from_airport  = 'Bắt buộc'
    if (!data.to_airport)    e.to_airport    = 'Bắt buộc'
    if (!data.route_id)      e.route_id      = 'Chưa tìm thấy route phù hợp'
    if (!data.flight_number) e.flight_number = 'Bắt buộc'
    if (!data.aircraft_id)   e.aircraft_id   = 'Bắt buộc'
    if (!data.departure_time) e.departure_time = 'Bắt buộc'
    if (!Array.isArray(data.days_of_week) || data.days_of_week.length === 0) e.days_of_week = 'Chọn ít nhất 1 ngày'
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
        flight_number:  createForm.flight_number.trim().toUpperCase(),
        days_of_week:   createForm.days_of_week.map(Number),
        aircraft_id:    Number(createForm.aircraft_id),
        departure_time: toApiTime(createForm.departure_time),
      })
      setCreateModal(false)
      setCreateForm({ from_airport: '', to_airport: '', route_id: '', flight_number: '', departure_time: '', days_of_week: [1], aircraft_id: '' })
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
            onClick={() => { setCreateModal(true); setCreateErrors({}); setLookupError('') }}
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
            placeholder="🔍 Mã chuyến, tuyến bay, lịch chạy..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã chuyến</th>
                <th>Tuyến bay</th>
                <th>Giờ đi</th>
                <th>Lịch chạy</th>
                <th>Máy bay</th>
                <th>Số hiệu</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && list.length === 0 ? (
                <tr><td colSpan={9}><div className="adm-empty">⏳ Đang tải...</div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9}><div className="adm-empty">{list.length === 0 ? 'Chưa có lịch bay' : 'Không tìm thấy'}</div></td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} style={{ opacity: loading ? 0.6 : 1 }}>
                  <td><span className="adm-mono" style={{ color: 'var(--text-dim)' }}>#{s.id}</span></td>
                  <td>
                    <span className="adm-mono" style={{ color: 'var(--accent2)', fontWeight: 600 }}>
                      {s.flightNumber || '—'}
                    </span>
                  </td>
                  <td>
                    <b style={{ color: 'var(--accent2)' }}>{s.from}</b>
                    <span style={{ color: 'var(--text-dim)', margin: '0 5px' }}>→</span>
                    <b style={{ color: 'var(--accent2)' }}>{s.to}</b>
                  </td>
                  <td><span className="adm-mono">{s.depTime || '—'}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-mid)' }}>{s.frequency || '—'}</td>
                  <td style={{ fontSize: 12 }}>{s.aircraft || '—'}</td>
                  <td><span className="adm-mono">{s.registrationNumber || '—'}</span></td>
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
            <button className="adm-btn adm-btn-ghost" disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>← Trước</button>
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
            <button className="adm-btn adm-btn-ghost" disabled={page >= totalPages || loading} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Sau →</button>
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
            <p>Kích hoạt lại lịch bay <b>{modal.item.flightNumber}</b> ({modal.item.route})?</p>
            <p style={{ marginTop: 8, color: 'var(--text-mid)' }}>
              Giờ đi: <b>{modal.item.depTime}</b> · Lịch chạy: <b>{modal.item.frequency || '—'}</b>
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
            <p>⚠️ Lịch bay <b>{modal.item.flightNumber}</b> ({modal.item.route}) sẽ bị ngừng khai thác.</p>
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
              <label className="adm-label">Điểm đi <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select
                className={`adm-input ${createErrors.from_airport ? 'adm-input-error' : ''}`}
                value={createForm.from_airport}
                disabled={lookupLoading}
                onChange={e => setCreateForm(f => ({ ...f, from_airport: e.target.value, route_id: '' }))}
              >
                <option value="">{lookupLoading ? 'Đang tải...' : '— Chọn sân bay đi —'}</option>
                {[...new Map(routeOptions.map(route => [route.from, { code: route.from, city: route.fromCity }])).values()].map(ap => (
                  <option key={ap.code} value={ap.code}>{ap.code} - {ap.city}</option>
                ))}
              </select>
              {createErrors.from_airport && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{createErrors.from_airport}</div>}
            </div>
            <div className="adm-field">
              <label className="adm-label">Điểm đến <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select
                className={`adm-input ${createErrors.to_airport ? 'adm-input-error' : ''}`}
                value={createForm.to_airport}
                disabled={lookupLoading}
                onChange={e => setCreateForm(f => ({ ...f, to_airport: e.target.value, route_id: '' }))}
              >
                <option value="">{lookupLoading ? 'Đang tải...' : '— Chọn sân bay đến —'}</option>
                {[...new Map(routeOptions.map(route => [route.to, { code: route.to, city: route.toCity }])).values()]
                  .filter(ap => ap.code !== createForm.from_airport)
                  .map(ap => (
                    <option key={ap.code} value={ap.code}>{ap.code} - {ap.city}</option>
                  ))}
              </select>
              {createErrors.to_airport && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{createErrors.to_airport}</div>}
            </div>
          </div>
          {lookupError && (
            <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: -6, marginBottom: 10 }}>
              {lookupError}
            </div>
          )}
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Mã chuyến bay <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className={`adm-input ${createErrors.flight_number ? 'adm-input-error' : ''}`}
                type="text" placeholder="VN26"
                value={createForm.flight_number}
                onChange={e => setCreateForm(f => ({ ...f, flight_number: e.target.value.toUpperCase() }))}
              />
              {createErrors.flight_number && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{createErrors.flight_number}</div>}
            </div>
            <div className="adm-field">
              <label className="adm-label">Route ID</label>
              <input
                className={`adm-input ${createErrors.route_id ? 'adm-input-error' : ''}`}
                value={createForm.route_id}
                disabled
                placeholder="Tự động xác định"
              />
              {createErrors.route_id && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{createErrors.route_id}</div>}
            </div>
          </div>
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Aircraft ID <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select
                className={`adm-input ${createErrors.aircraft_id ? 'adm-input-error' : ''}`}
                value={createForm.aircraft_id}
                onChange={e => setCreateForm(f => ({ ...f, aircraft_id: e.target.value }))}
                disabled={lookupLoading}
              >
                <option value="">{lookupLoading ? 'Đang tải...' : '— Chọn máy bay —'}</option>
                {aircraftOptions
                  .filter(item => String(item.status ?? '').toUpperCase() === 'ACTIVE')
                  .map(item => (
                    <option key={item.id} value={item.id}>
                      {item.id} - {item.model} ({item.registration_number})
                    </option>
                  ))}
              </select>
              {createErrors.aircraft_id && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{createErrors.aircraft_id}</div>}
            </div>
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
          </div>
          <div className="adm-field">
            <label className="adm-label">Ngày hoạt động <span style={{ color: 'var(--danger)' }}>*</span></label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DAY_OPTIONS.map(day => {
                const active = createForm.days_of_week.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    className="adm-btn adm-btn-sm"
                    style={{
                      minWidth: 52,
                      background: active ? 'var(--accent)' : 'var(--surface)',
                      color: active ? 'white' : 'var(--text)',
                      borderColor: active ? 'var(--accent)' : 'var(--border)',
                    }}
                    onClick={() => setCreateForm(f => ({
                      ...f,
                      days_of_week: f.days_of_week.includes(day.value)
                        ? f.days_of_week.filter(v => v !== day.value)
                        : [...f.days_of_week, day.value].sort((a, b) => a - b),
                    }))}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
            {createErrors.days_of_week && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{createErrors.days_of_week}</div>}
          </div>
        </Modal>
      )}
    </div>
  )
}
