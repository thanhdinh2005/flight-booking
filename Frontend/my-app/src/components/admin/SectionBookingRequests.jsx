import { useState, useEffect, useCallback } from 'react'
import Modal from '../model'
import { fmt } from './helpers'
import { bookingRequestAPI } from './adminAPI'

// ── Helper functions for input validation ──────────────────
function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '')
}

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

const MODAL_BODY_SCROLL_STYLE = {
  maxHeight: 'calc(100dvh - 320px)',
  overflowY: 'auto',
  paddingRight: 4,
}

const APPROVE_INFO_BOX_STYLE = {
  padding: '16px 18px',
  background: 'linear-gradient(180deg, rgba(34,197,94,.14), rgba(34,197,94,.09))',
  border: '1px solid rgba(88,255,161,.34)',
  borderRadius: 12,
  fontSize: 13,
  color: 'var(--text)',
  boxShadow: '0 12px 28px rgba(20, 88, 53, .16)',
}

const REJECT_INFO_BOX_STYLE = {
  padding: '14px 16px',
  background: 'linear-gradient(180deg, rgba(239,68,68,.14), rgba(239,68,68,.09))',
  border: '1px solid rgba(255,120,120,.28)',
  borderRadius: 12,
  fontSize: 13,
  color: 'var(--text)',
  marginBottom: 14,
  boxShadow: '0 12px 28px rgba(110, 25, 25, .14)',
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
  const [approveAmount, setApproveAmount] = useState('')
  const [approveNote, setApproveNote] = useState('')

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
      r.route.toLowerCase().includes(lower) ||
      String(r.ticketId ?? '').includes(lower) ||
      String(r.bookingId ?? '').includes(lower) ||
      String(r.reason ?? '').toLowerCase().includes(lower)
    )
  })

  // ── Actions ───────────────────────────────────────────────────────────────
  const openApprove = (item) => {
    setModal({ type: 'approve', item })
    setRejectReason('')
    setApproveAmount(String(item.refundAmount || item.systemRefundAmount || 0))
    setApproveNote(item.staffNote || '')
  }
  const openReject  = (item) => {
    setModal({ type: 'reject',  item })
    setRejectReason(item.staffNote || '')
  }

  const confirmAction = async () => {
    if (!modal) return
    const { type, item } = modal
    setLoading(true)
    setError('')
    try {
      let responseData = null

      if (type === 'approve') {
        const res = await bookingRequestAPI.approve(item.id, {
          final_amount: Number(approveAmount || 0),
          staff_note: approveNote.trim() || undefined,
        })
        responseData = res?.data ?? null
      } else {
        const res = await bookingRequestAPI.reject(item.id, {
          staff_note: rejectReason.trim() || undefined,
        })
        responseData = res?.data ?? null
      }

      const newStatus = String(responseData?.status ?? (type === 'approve' ? 'approved' : 'rejected')).toLowerCase()
      const nextRefundAmount = Number(
        responseData?.refund_amount ??
        responseData?.system_refund_amount ??
        (type === 'approve' ? Number(approveAmount || 0) : item.refundAmount)
      )
      const nextProcessedAt = responseData?.processed_at
        ? String(responseData.processed_at).substring(0, 10)
        : item.processedAt
      const nextStaffNote = String(
        responseData?.staff_note ??
        (type === 'approve' ? approveNote.trim() : rejectReason.trim())
      )

      setList(l => l.map(r => r.id === item.id
        ? {
            ...r,
            status: newStatus,
            refundAmount: nextRefundAmount,
            totalPrice: nextRefundAmount,
            processedAt: nextProcessedAt,
            staffNote: nextStaffNote,
            note: nextStaffNote,
            bookingId: responseData?.booking_id ?? r.bookingId,
            ticketId: responseData?.ticket_id ?? r.ticketId,
          }
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
          <div className="adm-sec-title">Yêu cầu hoàn vé</div>
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
                <th>Mã YC</th>
                <th>Khách hàng</th>
                <th>Vé</th>
                <th>Loại YC</th>
                <th>Tiền hoàn</th>
                <th>Giá gốc</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && list.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="adm-empty">⏳ Đang tải...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
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
                      #{r.ticketId}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-mid)' }}>{r.requestType?.toUpperCase() || 'REFUND'}</td>
                  <td>
                    <span className="adm-mono" style={{ color: 'var(--accent)' }}>
                      {fmt(r.refundAmount)}
                    </span>
                  </td>
                  <td><span className="adm-mono">{fmt(r.originalPrice)}</span></td>
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
          title="Xác nhận duyệt yêu cầu"
          sub={`Booking: ${modal.item.code}`}
          onClose={() => setModal(null)}
          overlayClassName="adm-overlay-booking-action"
          modalClassName="adm-modal-booking-action"
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
          <div style={MODAL_BODY_SCROLL_STYLE}>
            <div style={APPROVE_INFO_BOX_STYLE}>
              <div style={{ marginBottom: 10, fontWeight: 700, color: '#93f5bd' }}>Thông tin yêu cầu</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                <div><span style={{ color: 'rgba(225,236,255,.72)' }}>Khách hàng:</span><br /><b style={{ color: '#f3fbff' }}>{modal.item.customer}</b></div>
                <div><span style={{ color: 'rgba(225,236,255,.72)' }}>Vé:</span><br /><b style={{ color: '#f3fbff' }}>#{modal.item.ticketId}</b></div>
                <div><span style={{ color: 'rgba(225,236,255,.72)' }}>Loại yêu cầu:</span><br /><b style={{ color: '#f3fbff' }}>{modal.item.requestType?.toUpperCase()}</b></div>
                <div><span style={{ color: 'rgba(225,236,255,.72)' }}>Tiền hoàn đề xuất:</span><br /><b style={{ color: '#7ff7b5' }}>{fmt(modal.item.refundAmount)}</b></div>
                <div><span style={{ color: 'rgba(225,236,255,.72)' }}>Giá vé gốc:</span><br /><b style={{ color: '#f3fbff' }}>{fmt(modal.item.originalPrice)}</b></div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'rgba(225,236,255,.72)' }}>Lý do:</span><br /><b style={{ color: '#f3fbff' }}>{modal.item.reason || '—'}</b></div>
              </div>
            </div>
            <div className="adm-field" style={{ marginTop: 14 }}>
              <label className="adm-label">Số tiền hoàn cuối cùng</label>
              <input
                className="adm-input"
                type="text"
                min="0"
                value={approveAmount}
                onChange={e => setApproveAmount(digitsOnly(e.target.value))}
                onKeyDown={e => {
                  const allowKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
                  if (e.ctrlKey || e.metaKey || allowKeys.includes(e.key)) return
                  if (!/^\d$/.test(e.key) && e.key.length === 1) e.preventDefault()
                }}
                inputMode="numeric"
                placeholder="Nhập số tiền hoàn"
              />
            </div>
            <div className="adm-field">
              <label className="adm-label">Ghi chú nhân viên <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>(tùy chọn)</span></label>
              <textarea
                className="adm-input"
                rows={2}
                placeholder="Nhập ghi chú xử lý..."
                value={approveNote}
                onChange={e => setApproveNote(e.target.value)}
                style={{ resize: 'vertical', minHeight: 64 }}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal TỪ CHỐI ─────────────────────────────────────────────────── */}
      {modal?.type === 'reject' && (
        <Modal
          title="Từ chối yêu cầu"
          sub={`Booking: ${modal.item.code}`}
          onClose={() => setModal(null)}
          overlayClassName="adm-overlay-booking-action"
          modalClassName="adm-modal-booking-action"
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
          <div style={MODAL_BODY_SCROLL_STYLE}>
            <div style={REJECT_INFO_BOX_STYLE}>
              <p>Từ chối yêu cầu của <b>{modal.item.customer}</b> cho vé <b>#{modal.item.ticketId}</b>.</p>
            </div>
            <div className="adm-field">
              <label className="adm-label">Ghi chú từ chối <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>(tùy chọn)</span></label>
              <textarea
                className="adm-input"
                rows={2}
                placeholder="Nhập ghi chú để thông báo cho khách hàng..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{ resize: 'vertical', minHeight: 64 }}
              />
            </div>
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
              ['Mã yêu cầu', detail.code],
              ['Khách hàng', detail.customer],
              ['Booking ID', detail.bookingId || '—'],
              ['Ticket ID', detail.ticketId || '—'],
              ['Loại yêu cầu', detail.requestType?.toUpperCase() || '—'],
              ['Hạng ghế', detail.seatClass || '—'],
              ['Tiền hoàn', fmt(detail.refundAmount)],
              ['Giá vé gốc', fmt(detail.originalPrice)],
              ['Trạng thái', <StatusBadge value={detail.status} />],
              ['Ngày tạo', detail.createdAt],
              ['Lý do', detail.reason || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 2 }}>{label}</div>
                <div style={{ fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
          {detail.staffNote && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8, fontSize: 12, color: 'var(--text-mid)' }}>
              <b>Ghi chú nhân viên:</b> {detail.staffNote}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
