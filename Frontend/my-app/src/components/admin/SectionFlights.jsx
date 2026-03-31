import { useState, useEffect, useCallback, useRef } from 'react'
import Badge from '../badge'
import Modal from '../model'
import DatePicker, { isBeforeIsoDate } from '../common/DatePicker'
import { flightAPI, flightFilterAPI } from './adminAPI'
import { INIT_FLIGHTS } from './mockData'
import { getToken, isTokenExpired } from '../../services/keycloakService'

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api'

const FLIGHT_STATUSES = ['ALL', 'SCHEDULED', 'DEPARTED', 'DELAYED', 'CANCELLED']
const STATUS_LABEL = { ALL: 'Tất cả', SCHEDULED: 'Đã lên lịch', DEPARTED: 'Đã bay', DELAYED: 'Hoãn', CANCELLED: 'Đã hủy' }

function fmtDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('vi-VN')
}

// ─── Detail drawer ─────────────────────────────────────────────────────────
function FlightDetailModal({ flightId, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!flightId) return
    setLoading(true)
    flightFilterAPI.getById(flightId)
      .then(d => { setData(d); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [flightId])

  return (
    <Modal
      title={`Chi tiết chuyến bay`}
      sub={`ID #${flightId}`}
      onClose={onClose}
      footer={<button className="adm-btn adm-btn-ghost" onClick={onClose}>Đóng</button>}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-dim)' }}>⏳ Đang tải...</div>
      ) : error ? (
        <div style={{ color: 'var(--danger)', padding: 12 }}>⚠️ {error}</div>
      ) : data ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', fontSize: 13 }}>
          {[
            ['ID',         data.id || '—'],
            ['Mã chuyến',  data.flight_number || '—'],
            ['Tuyến',      data.from && data.to ? `${data.from} → ${data.to}` : '—'],
            ['Ngày khởi hành', data.date || '—'],
            ['STD',        fmtDateTime(data.std)],
            ['STA',        fmtDateTime(data.sta)],
            ['ETD',        fmtDateTime(data.etd)],
            ['ETA',        fmtDateTime(data.eta)],
            ['Máy bay',    data.aircraft || '—'],
            ['Số đăng ký', data.registration_number || '—'],
            ['Tạo lúc',    fmtDateTime(data.created_at)],
            ['Cập nhật lúc', fmtDateTime(data.updated_at)],
            ['Trạng thái', <Badge value={data.status} />],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 2 }}>{label}</div>
              <div style={{ fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </Modal>
  )
}

// ─── Main component ───────────────────────────────────────────────────────
export function SectionFlights() {
  const [list, setList]         = useState(INIT_FLIGHTS)
  const [meta, setMeta]         = useState({ total: 0, last_page: 1, current_page: 1 })
  const [q, setQ]               = useState('')
  const [modal, setModal]       = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [fromDate, setFromDate]         = useState('')
  const [toDate, setToDate]             = useState('')

  // Pagination
  const [page, setPage]   = useState(1)
  const [perPage]         = useState(10)

  // Generate form
  const [gen, setGen] = useState({ from: '', to: '', route_id: '', aircraft_id: '', date: '2026-03-20', time: '10:00' })
  const [routeOptions, setRouteOptions]   = useState([])
  const [aircraftOptions, setAircraftOptions] = useState([])
  const [modalLoading, setModalLoading]   = useState(false)
  const [modalError, setModalError]       = useState('')
  const genRefs = useRef({})

  // ── Fetch với filter ───────────────────────────────────────────────────
  const fetchFlights = useCallback(async (p = page) => {
    setLoading(true)
    setError('')
    try {
      // Dùng filter endpoint nếu có bất kỳ filter nào, ngược lại dùng getPage
      const hasFilter = statusFilter !== 'ALL' || fromDate || toDate
      let result

      if (hasFilter) {
        result = await flightFilterAPI.filter({
          status:    statusFilter !== 'ALL' ? statusFilter : '',
          from_date: fromDate,
          to_date:   toDate,
          page:      p,
          per_page:  perPage,
        })
      } else {
        result = await flightAPI.getPage({ page: p, per_page: perPage })
      }

      setList(result.data)
      setMeta(result.meta ?? { total: result.data.length, last_page: 1, current_page: p, per_page: perPage })
    } catch (err) {
      console.error('[SectionFlights] fetchFlights lỗi:', err.message)
      setError('Lỗi tải chuyến bay: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, fromDate, toDate, perPage])

  useEffect(() => { fetchFlights(page) }, [page, statusFilter, fromDate, toDate])

  // Reset page khi đổi filter
  const applyFilter = () => { setPage(1); fetchFlights(1) }
  const clearFilter = () => { setStatusFilter('ALL'); setFromDate(''); setToDate(''); setPage(1) }
  const changeStatus = (s) => { setStatusFilter(s); setPage(1) }

  const handleFromDateChange = (value) => {
    setFromDate(value)
    if (toDate && isBeforeIsoDate(toDate, value)) setToDate(value)
  }

  const handleToDateChange = (value) => {
    if (fromDate && isBeforeIsoDate(value, fromDate)) {
      setToDate(fromDate)
      return
    }
    setToDate(value)
  }

  // ── Client-side search ─────────────────────────────────────────────────
  const filtered = list.filter(f => {
    const search = q.toUpperCase()
    return (
      String(f.id ?? '').toUpperCase().includes(search) ||
      String(f.from ?? '').toUpperCase().includes(search) ||
      String(f.to ?? '').toUpperCase().includes(search) ||
      String(f.flight_number ?? '').toUpperCase().includes(search)
    )
  })

  // ── Modal resources ───────────────────────────────────────────────────
  const fetchModalResources = useCallback(async () => {
    setModalLoading(true)
    setModalError('')
    try {
      const token = getToken()
      if (!token || isTokenExpired()) {
        throw new Error('Phiên đăng nhập admin đã hết hạn')
      }
      const [routeRes, aircraftRes] = await Promise.all([
        fetch(`${API_BASE}/admin/routes`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE}/admin/aircraft`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      const routeData = await routeRes.json().catch(() => ({}))
      const aircraftData = await aircraftRes.json().catch(() => ({}))

      if (!routeRes.ok) throw new Error(routeData?.message || `HTTP ${routeRes.status}`)
      if (!aircraftRes.ok) throw new Error(aircraftData?.message || `HTTP ${aircraftRes.status}`)

      const routes = Array.isArray(routeData) ? routeData : (routeData.data ?? [])
      const aircraft = Array.isArray(aircraftData) ? aircraftData : (aircraftData.data ?? [])

      setRouteOptions(routes.map(route => ({
        id: String(route.id ?? ''),
        from: route.origin?.code ?? '',
        fromCity: route.origin?.city ?? route.origin?.name ?? '',
        to: route.destination?.code ?? '',
        toCity: route.destination?.city ?? route.destination?.name ?? '',
      })).filter(route => route.id && route.from && route.to))
      setAircraftOptions(aircraft)
    } catch (err) {
      setModalError(err.message || 'Không tải được dữ liệu tạo chuyến bay')
    } finally {
      setModalLoading(false)
    }
  }, [])

  const openGenerateModal = async () => {
    if (routeOptions.length === 0 || aircraftOptions.length === 0) {
      await fetchModalResources()
    }
    const activeAircraft = aircraftOptions.find(item => String(item.status ?? '').toUpperCase() === 'ACTIVE') ?? aircraftOptions[0]
    setGen(prev => ({
      ...prev,
      aircraft_id: prev.aircraft_id || String(activeAircraft?.id ?? ''),
    }))
    setModal(true)
  }

  useEffect(() => {
    const matchedRoute = routeOptions.find(route => route.from === gen.from && route.to === gen.to)
    const nextRouteId = matchedRoute?.id ?? ''
    setGen(prev => prev.route_id === nextRouteId ? prev : { ...prev, route_id: nextRouteId })
  }, [gen.from, gen.to, routeOptions])

  // ── Generate ──────────────────────────────────────────────────────────
  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      if (!gen.from) {
        genRefs.current.from?.focus?.()
        throw new Error('Vui lòng chọn điểm đi')
      }
      if (!gen.to) {
        genRefs.current.to?.focus?.()
        throw new Error('Vui lòng chọn điểm đến')
      }
      if (gen.from === gen.to) {
        genRefs.current.to?.focus?.()
        throw new Error('Điểm đi và điểm đến không được trùng nhau')
      }
      if (!gen.route_id) throw new Error('Không tìm thấy tuyến bay phù hợp')
      if (!gen.aircraft_id) {
        genRefs.current.aircraft_id?.focus?.()
        throw new Error('Vui lòng chọn Aircraft ID')
      }
      if (!gen.date) {
        genRefs.current.date?.querySelector('button')?.focus?.()
        throw new Error('Vui lòng chọn ngày bay')
      }
      if (!gen.time) {
        genRefs.current.time?.focus?.()
        throw new Error('Vui lòng chọn giờ bay')
      }

      await flightAPI.create({
        route_id: Number(gen.route_id),
        aircraft_id: Number(gen.aircraft_id),
        flight_number: `VN${Math.floor(100 + Math.random() * 900)}`,
        departure_date: gen.date,
        departure_time: gen.time,
      })
      const newPage = 1 
      setPage(newPage)
      setStatusFilter('ALL')
      setFromDate('')
      setToDate('')
      setGen(prev => ({ ...prev, aircraft_id: prev.aircraft_id, time: '10:00' }))
      await fetchFlights(newPage)
    } catch (err) {
      setError('Lỗi tạo chuyến bay: ' + err.message)
    } finally {
      setLoading(false)
      setModal(false)
    }
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  const totalPages = meta.last_page ?? 1
  const total      = meta.total ?? 0
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)

  const hasActiveFilter = statusFilter !== 'ALL' || fromDate || toDate

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="adm-fade">

      {/* Header */}
      <div className="adm-sec-header">
          <div>
            <div className="adm-sec-title">Quản lý chuyến bay</div>
            <div className="adm-sec-sub">{total} chuyến · Trang {page}/{totalPages}</div>
          </div>
        <div className="adm-row" style={{ gap: 8 }}>
          <button className="adm-btn adm-btn-ghost" onClick={() => fetchFlights(page)} disabled={loading}>🔄 Làm mới</button>
          <button className="adm-btn adm-btn-ghost" onClick={openGenerateModal} disabled={loading || modalLoading}>
            {modalLoading ? '⏳ Đang chuẩn bị...' : '✈ Tạo chuyến bay'}
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
        {/* Toolbar */}
        <div className="adm-toolbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
          {/* Search */}
          <input
            className="adm-search"
            style={{ width: '100%' }}
            placeholder="🔍 Tìm mã bay, điểm đi/đến..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />

          {/* Status chips */}
          <div className="adm-chips">
            {FLIGHT_STATUSES.map(s => (
              <div key={s} className={`adm-chip ${statusFilter === s ? 'on' : ''}`} onClick={() => changeStatus(s)}>
                {STATUS_LABEL[s]}
              </div>
            ))}
          </div>

          {/* Date range filter */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Từ ngày:</label>
              <DatePicker value={fromDate} onChange={handleFromDateChange} placeholder="Từ ngày" theme="admin" triggerStyle={{ minWidth: 150, height: 34, padding: '6px 10px', fontSize: 13 }} />
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Đến ngày:</label>
              <DatePicker value={toDate} onChange={handleToDateChange} minDate={fromDate || undefined} placeholder="Đến ngày" theme="admin" triggerStyle={{ minWidth: 150, height: 34, padding: '6px 10px', fontSize: 13 }} />
            </div>
            {hasActiveFilter && (
              <button
                className="adm-btn adm-btn-ghost adm-btn-sm"
                onClick={clearFilter}
                title="Xóa bộ lọc"
              >
                ✕ Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Mã bay</th>
                <th>Tuyến</th>
                <th>Ngày</th>
                <th>Giờ đi</th>
                <th>Giờ đến</th>
                <th>Máy bay</th>
                <th>Đăng ký</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}><div className="adm-empty">{loading ? '⏳ Đang tải...' : 'Không tìm thấy'}</div></td></tr>
              ) : filtered.map(f => (
                <tr key={f.id} style={{ opacity: loading ? 0.6 : 1 }}>
                  <td>
                    <span style={{ fontFamily: 'DM Mono', color: 'var(--accent2)', fontWeight: 600 }}>
                      {f.flight_number || '—'}
                    </span>
                  </td>
                  <td>
                    <b>{f.from}</b>
                    <span style={{ color: 'var(--text-dim)', margin: '0 5px' }}>→</span>
                    <b>{f.to}</b>
                  </td>
                  <td><span className="adm-mono">{f.date}</span></td>
                  <td><span className="adm-mono">{f.dep}</span></td>
                  <td><span className="adm-mono">{f.arr}</span></td>
                  <td>{f.aircraft || '—'}</td>
                  <td><span className="adm-mono">{f.registration_number || '—'}</span></td>
                  <td><Badge value={f.status} /></td>
                  <td>
                    <button
                      className="adm-btn adm-btn-ghost adm-btn-sm"
                      onClick={() => setDetailId(f.id)}
                      title="Xem chi tiết"
                    >
                      🔍
                    </button>
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

      {/* Detail modal */}
      {detailId && <FlightDetailModal flightId={detailId} onClose={() => setDetailId(null)} />}

      {/* Generate modal */}
      {modal && (
        <Modal title="Tạo chuyến bay" sub="Chọn tuyến bay, máy bay, ngày và giờ khởi hành" onClose={() => setModal(false)} closeOnOverlay={false}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)} disabled={loading}>Hủy</button>
              <button className="adm-btn adm-btn-primary" onClick={generate} disabled={loading || modalLoading || !gen.from || !gen.to || !gen.route_id || !gen.aircraft_id || !gen.time}>
                {loading ? '⏳ Đang tạo...' : 'Tạo chuyến bay'}
              </button>
            </>
          }>
          {modalError && (
            <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 12 }}>
              {modalError}
            </div>
          )}
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Điểm đi</label>
              <select
                className="adm-input"
                ref={node => { genRefs.current.from = node }}
                value={gen.from}
                disabled={modalLoading}
                onChange={e => setGen(g => ({ ...g, from: e.target.value, to: g.to === e.target.value ? '' : g.to }))}
                style={{ cursor: 'pointer' }}
              >
                <option value="">{modalLoading ? 'Đang tải...' : '— Chọn sân bay đi —'}</option>
                {[...new Map(routeOptions.map(route => [route.from, { code: route.from, city: route.fromCity }])).values()]
                  .filter(ap => ap.code !== gen.to)
                  .map(ap => (
                  <option key={ap.code} value={ap.code}>{ap.code} - {ap.city}</option>
                ))}
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">Điểm đến</label>
              <select
                className="adm-input"
                ref={node => { genRefs.current.to = node }}
                value={gen.to}
                disabled={modalLoading}
                onChange={e => setGen(g => ({ ...g, to: e.target.value }))}
                style={{ cursor: 'pointer' }}
              >
                <option value="">{modalLoading ? 'Đang tải...' : '— Chọn sân bay đến —'}</option>
                {[...new Map(routeOptions.map(route => [route.to, { code: route.to, city: route.toCity }])).values()]
                  .filter(ap => ap.code !== gen.from)
                  .map(ap => (
                    <option key={ap.code} value={ap.code}>{ap.code} - {ap.city}</option>
                  ))}
              </select>
            </div>
          </div>
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Aircraft ID</label>
              <select
                className="adm-input"
                ref={node => { genRefs.current.aircraft_id = node }}
                value={gen.aircraft_id}
                disabled={modalLoading}
                onChange={e => setGen(g => ({ ...g, aircraft_id: e.target.value }))}
                style={{ cursor: 'pointer' }}
              >
                <option value="">{modalLoading ? 'Đang tải...' : '— Chọn máy bay —'}</option>
                {aircraftOptions
                  .filter(item => String(item.status ?? '').toUpperCase() === 'ACTIVE')
                  .map(item => (
                    <option key={item.id} value={item.id}>
                      {item.id} - {item.model} ({item.registration_number})
                    </option>
                  ))}
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">Ngày bay</label>
              <div ref={node => { genRefs.current.date = node }}>
                <DatePicker value={gen.date} onChange={value => setGen(g => ({ ...g, date: value }))} placeholder="Chọn ngày bay" theme="admin" />
              </div>
            </div>
          </div>
          <div className="adm-2col">
            <div className="adm-field">
              <label className="adm-label">Giờ bay</label>
              <input
                className="adm-input"
                ref={node => { genRefs.current.time = node }}
                type="time"
                value={gen.time}
                onChange={e => setGen(g => ({ ...g, time: e.target.value }))}
              />
            </div>
            <div className="adm-field">
              <label className="adm-label">Route ID</label>
              <input
                className="adm-input"
                value={gen.route_id}
                disabled
                placeholder="Tự động xác định"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
