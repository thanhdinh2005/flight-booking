import { useState, useEffect, useCallback } from 'react'
import Badge from '../badge'
import Modal from '../model'
import { fmt } from './helpers'
import { bookingRequestAPI } from './adminAPI'

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUSES = ['all', 'pending', 'approved', 'rejected']
const STATUS_LABEL = { all: 'Tất cả', pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' }
const STATUS_COLOR = {
  pending:  { bg: 'rgba(245,158,11,.15)',  color: '#f59e0b'  },
  approved: { bg: 'rgba(34,197,94,.15)',   color: '#22c55e'  },
  rejected: { bg: 'rgba(239,68,68,.15)',   color: '#ef4444'  },
}

// ─── Helper badge ─────────────────────────────────────────────────────────────
function StatusBadge({ value }) {
  const s = STATUS_COLOR[value] ?? { bg: 'rgba(107,114,128,.15)', color: '#6b7280' }
  const icons = { pending: '⏳', approved: '✅', rejected: '❌' }
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {icons[value] ?? '•'} {STATUS_LABEL[value] ?? value}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SectionBookingRequests() {
  const [list, setList]         = useState([])
  const [meta, setMeta]         = useState({ total: 0, last_page: 1, current_page: 1 })
  const [statusFilter, setStatus] = useState('all')
  const [q, setQ]               = useState('')
  const [page, setPage]         = useState(1)
  const PER_PAGE                = 15

  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Modal state: { type: 'approve'|'reject', item: BookingRequest }
  const [modal, setModal]       = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  // Detail drawer
  const [detail, setDetail]     = useState(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (p = page, st = statusFilter) => {
    setLoading(true)
    setError('')
    try {
      const res = await bookingRequestAPI.getAll({ status: st, page: p, per_page: PER_PAGE })
      setList(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError('Lỗi tải dữ liệu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchData(page, statusFilter) }, [page, statusFilter])

  // Reset page khi đổi filter
  const changeStatus = (s) => { setStatus(s); setPage(1) }

  // ── Client-side search trên dữ liệu đã fetch ─────────────────────────────
  const filtered = list.filter(r => {
    if (!q.trim()) return true
    const lower = q.toLowerCase()
    return (
      String(r.id).includes(lower) ||
      r.code.toLowerCase().includes(lower) ||
      r.customer.toLowerCase().includes(lower) ||
      r.flight.toLowerCase().includes(lower) ||
      r.route.toLowerCase().includes(lower)
    )
  })

  // ── Actions ───────────────────────────────────────────────────────────────
  const openApprove = (item) => { setModal({ type: 'approve', item }); setRejectReason('') }
  const openReject  = (item) => { setModal({ type: 'reject',  item }); setRejectReason('') }

  const confirmAction = async () => {
    if (!modal) return
    const { type, item } = modal
    setLoading(true)
    setError('')
    try {
      if (type === 'approve') {
        await bookingRequestAPI.approve(item.id)
      } else {
        await bookingRequestAPI.reject(item.id, { reason: rejectReason.trim() || undefined })
      }
      // Cập nhật local state ngay, không cần reload toàn bộ
      const newStatus = type === 'approve' ? 'approved' : 'rejected'
      setList(l => l.map(r => r.id === item.id
        ? { ...r, status: newStatus, note: type === 'reject' ? rejectReason : r.note }
        : r
      ))
      setModal(null)
    } catch (err) {
      setError(`Lỗi ${type === 'approve' ? 'duyệt' : 'từ chối'}: ` + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Pagination helper ─────────────────────────────────────────────────────
  const totalPages = meta.last_page ?? 1
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="adm-fade">

      {/* Header */}
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Yêu cầu đặt vé</div>
          <div className="adm-sec-sub">
            {meta.total} yêu cầu · Trang {page}/{totalPages}
          </div>
        </div>
        <button
          className="adm-btn adm-btn-ghost"
          onClick={() => fetchData(page, statusFilter)}
          disabled={loading}
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '12px 16px', borderRadius: 4, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18 }} onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="adm-card">
        {/* Toolbar */}
        <div className="adm-toolbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
          <input
            className="adm-search"
            style={{ width: '100%' }}
            placeholder="🔍 Mã booking, khách hàng, chuyến bay..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <div className="adm-chips">
            {STATUSES.map(s => (
              <div
                key={s}
                className={`adm-chip ${statusFilter === s ? 'on' : ''}`}
                onClick={() => changeStatus(s)}
                style={statusFilter === s && s !== 'all' ? {
                  background: STATUS_COLOR[s]?.bg,
                  color: STATUS_COLOR[s]?.color,
                  borderColor: STATUS_COLOR[s]?.color,
                } : {}}
              >
                {STATUS_LABEL[s]}
                {s === 'pending' && meta.total > 0 && statusFilter !== 'pending' && (
                  <span style={{ marginLeft: 5, background: '#f59e0b', color: 'white', borderRadius: '50%', padding: '0 5px', fontSize: 10 }}>
                    !
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách hàng</th>
                <th>Chuyến</th>
                <th>Tuyến</th>
                <th>Ngày bay</th>
                <th>Số ghế</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && list.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="adm-empty">⏳ Đang tải...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="adm-empty">
                      {list.length === 0 ? 'Không có yêu cầu nào' : 'Không tìm thấy kết quả'}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r.id} style={{ opacity: loading ? 0.6 : 1 }}>
                  <td>
                    <span
                      className="adm-mono"
                      style={{ color: 'var(--accent2)', cursor: 'pointer', textDecoration: 'underline dotted' }}
                      onClick={() => setDetail(r)}
                      title="Xem chi tiết"
                    >
                      {r.code}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{r.customer}</td>
                  <td>
                    <span style={{ fontFamily: 'DM Mono', fontWeight: 600, color: 'var(--accent2)' }}>
                      {r.flight}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-mid)' }}>{r.route}</td>
                  <td><span className="adm-mono">{r.date}</span></td>
                  <td style={{ textAlign: 'center' }}>{r.seats}</td>
                  <td>
                    <span className="adm-mono" style={{ color: 'var(--accent)' }}>
                      {fmt(r.totalPrice)}
                    </span>
                  </td>
                  <td><StatusBadge value={r.status} /></td>
                  <td><span className="adm-mono">{r.createdAt}</span></td>
                  <td>
                    {r.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          className="adm-btn adm-btn-sm"
                          style={{ color: '#22c55e', borderColor: 'rgba(34,197,94,.3)', background: 'rgba(34,197,94,.08)' }}
                          disabled={loading}
                          onClick={() => openApprove(r)}
                          title="Duyệt yêu cầu"
                        >
                          ✅ Duyệt
                        </button>
                        <button
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          disabled={loading}
                          onClick={() => openReject(r)}
                          title="Từ chối yêu cầu"
                        >
                          ❌ Từ chối
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>—</span>
                    )}
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
                  <span key={`gap-${p}`} style={{ alignSelf: 'center', color: 'var(--text-dim)' }}>…</span>
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

      {/* ── Modal DUYỆT ───────────────────────────────────────────────────── */}
      {modal?.type === 'approve' && (
        <Modal
          title="Xác nhận duyệt vé"
          sub={`Booking: ${modal.item.code}`}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)} disabled={loading}>Hủy</button>
              <button
                className="adm-btn adm-btn-primary"
                onClick={confirmAction}
                disabled={loading}
                style={{ background: '#22c55e', borderColor: '#22c55e' }}
              >
                {loading ? '⏳ Đang xử lý...' : '✅ Xác nhận duyệt'}
              </button>
            </>
          }
        >
          <div style={{ padding: '14px 16px', background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 8, fontSize: 13 }}>
            <div style={{ marginBottom: 10, fontWeight: 600, color: 'var(--accent2)' }}>Thông tin booking</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              <div><span style={{ color: 'var(--text-dim)' }}>Khách hàng:</span><br /><b>{modal.item.customer}</b></div>
              <div><span style={{ color: 'var(--text-dim)' }}>Chuyến bay:</span><br /><b>{modal.item.flight}</b></div>
              <div><span style={{ color: 'var(--text-dim)' }}>Tuyến:</span><br /><b>{modal.item.route}</b></div>
              <div><span style={{ color: 'var(--text-dim)' }}>Ngày bay:</span><br /><b>{modal.item.date}</b></div>
              <div><span style={{ color: 'var(--text-dim)' }}>Số ghế:</span><br /><b>{modal.item.seats}</b></div>
              <div><span style={{ color: 'var(--text-dim)' }}>Tổng tiền:</span><br /><b style={{ color: 'var(--accent)' }}>{fmt(modal.item.totalPrice)}</b></div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 12 }}>
            Sau khi duyệt, vé sẽ được xác nhận và khách hàng sẽ nhận thông báo.
          </p>
        </Modal>
      )}

      {/* ── Modal TỪ CHỐI ─────────────────────────────────────────────────── */}
      {modal?.type === 'reject' && (
        <Modal
          title="Từ chối yêu cầu"
          sub={`Booking: ${modal.item.code}`}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)} disabled={loading}>Hủy</button>
              <button
                className="adm-btn adm-btn-danger"
                onClick={confirmAction}
                disabled={loading}
              >
                {loading ? '⏳ Đang xử lý...' : '❌ Xác nhận từ chối'}
              </button>
            </>
          }
        >
          <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
            <p>Từ chối yêu cầu của <b>{modal.item.customer}</b> — chuyến <b>{modal.item.flight}</b> ({modal.item.route}).</p>
          </div>
          <div className="adm-field">
            <label className="adm-label">Lý do từ chối <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>(tùy chọn)</span></label>
            <textarea
              className="adm-input"
              rows={3}
              placeholder="Nhập lý do để thông báo cho khách hàng..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              style={{ resize: 'vertical', minHeight: 80 }}
            />
          </div>
        </Modal>
      )}

      {/* ── Modal CHI TIẾT ────────────────────────────────────────────────── */}
      {detail && (
        <Modal
          title={`Chi tiết: ${detail.code}`}
          sub={`ID #${detail.id}`}
          onClose={() => setDetail(null)}
          footer={
            <>
              {detail.status === 'pending' && (
                <>
                  <button
                    className="adm-btn adm-btn-danger adm-btn-sm"
                    onClick={() => { setDetail(null); openReject(detail) }}
                  >❌ Từ chối</button>
                  <button
                    className="adm-btn adm-btn-sm"
                    style={{ background: '#22c55e', color: 'white', borderColor: '#22c55e' }}
                    onClick={() => { setDetail(null); openApprove(detail) }}
                  >✅ Duyệt</button>
                </>
              )}
              <button className="adm-btn adm-btn-ghost" onClick={() => setDetail(null)}>Đóng</button>
            </>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', fontSize: 13 }}>
            {[
              ['Mã booking', detail.code],
              ['Khách hàng', detail.customer],
              ['Chuyến bay', detail.flight],
              ['Tuyến', detail.route],
              ['Ngày bay', detail.date],
              ['Giờ đi', detail.dep || '—'],
              ['Số ghế', detail.seats],
              ['Tổng tiền', fmt(detail.totalPrice)],
              ['Trạng thái', <StatusBadge value={detail.status} />],
              ['Ngày tạo', detail.createdAt],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 2 }}>{label}</div>
                <div style={{ fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
          {detail.note && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8, fontSize: 12, color: 'var(--text-mid)' }}>
              <b>Ghi chú:</b> {detail.note}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}