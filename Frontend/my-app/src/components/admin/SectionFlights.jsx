import { useState, useEffect, useCallback } from 'react'
import Badge from '../badge'
import Modal from '../model'
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
  const [gen, setGen] = useState({ from: '', to: '', date: '2026-03-20', count: 2 })

  // Airport list
  const [airports, setAirports]           = useState([])
  const [airportsLoading, setAirportsLoading] = useState(false)
  const [airportsError, setAirportsError]     = useState('')

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

  // ── Airports ──────────────────────────────────────────────────────────
  const fetchAirports = async () => {
    setAirportsLoading(true)
    setAirportsError('')
    try {
      const token = getToken()
      if (!token || isTokenExpired()) {
        throw new Error('Phiên đăng nhập admin đã hết hạn')
      }
      const res = await fetch(`${API_BASE}/airports`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAirports(Array.isArray(data) ? data : (data.data ?? []))
    } catch (err) {
      setAirportsError(err.message || 'Không tải được danh sách sân bay')
    } finally {
      setAirportsLoading(false)
    }
  }

  useEffect(() => { if (modal && airports.length === 0) fetchAirports() }, [modal])

  const AirportSelect = ({ field, label }) => {
    if (airportsLoading) return (
      <div className="adm-field">
        <label className="adm-label">{label}</label>
        <input className="adm-input" value={gen[field]} disabled placeholder="Đang tải..." />
      </div>
    )
    if (airportsError || airports.length === 0) return (
      <div className="adm-field">
        <label className="adm-label">{label}</label>
        <input
          className="adm-input"
          value={gen[field]}
          maxLength={3}
          onChange={e => setGen(g => ({ ...g, [field]: e.target.value.toUpperCase() }))}
          placeholder={field === 'from' ? 'HAN' : 'SGN'}
        />
        {airportsError && <span style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, display: 'block' }}>{airportsError} — nhập mã thủ công</span>}
      </div>
    )
    return (
      <div className="adm-field">
        <label className="adm-label">{label}</label>
        <select className="adm-input" value={gen[field]} onChange={e => setGen(g => ({ ...g, [field]: e.target.value }))} style={{ cursor: 'pointer' }}>
          <option value="">— Chọn sân bay —</option>
          {airports.map(ap => {
            const code = ap.iata_code ?? ap.code ?? ap.id ?? ''
            const name = ap.name ?? ap.city ?? code
            const otherField = field === 'from' ? 'to' : 'from'
            if (!code || code === gen[otherField]) return null
            return <option key={code} value={code}>{code} – {name}</option>
          })}
        </select>
      </div>
    )
  }

  // ── Generate ──────────────────────────────────────────────────────────
  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await flightAPI.generate({
        from: gen.from, to: gen.to, date: gen.date,
        count: +gen.count,
      })
      const newPage = 1 // về trang 1 sau khi tạo
      setPage(newPage)
      setStatusFilter('ALL')
      setFromDate('')
      setToDate('')
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
          <button className="adm-btn adm-btn-ghost" onClick={() => setModal(true)} disabled={loading}>⚡ Sinh tự động</button>
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
              <input
                className="adm-input"
                type="date"
                style={{ padding: '5px 10px', fontSize: 13, height: 34 }}
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Đến ngày:</label>
              <input
                className="adm-input"
                type="date"
                style={{ padding: '5px 10px', fontSize: 13, height: 34 }}
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
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

      {/* Detail modal */}
      {detailId && <FlightDetailModal flightId={detailId} onClose={() => setDetailId(null)} />}

      {/* Generate modal */}
      {modal && (
        <Modal title="Sinh chuyến bay tự động" sub="Tạo nhiều chuyến theo lịch" onClose={() => setModal(false)}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)} disabled={loading}>Hủy</button>
              <button className="adm-btn adm-btn-primary" onClick={generate} disabled={loading || !gen.from || !gen.to}>
                {loading ? '⏳ Đang tạo...' : 'Tạo chuyến bay'}
              </button>
            </>
          }>
          <div className="adm-2col">
            <AirportSelect field="from" label="Điểm đi" />
            <AirportSelect field="to" label="Điểm đến" />
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
          </div>
        </Modal>
      )}
    </div>
  )
}
