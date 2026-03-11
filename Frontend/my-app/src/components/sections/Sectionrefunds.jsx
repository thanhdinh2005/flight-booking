import { useState, useEffect } from 'react'
import Badge from '../badge'
import api from './api'
import { Spinner, ErrBox } from './Shared'

/* ════════════════════════════════════════════
   SECTION: REFUND REQUESTS
   API: GET /requests, POST approve, POST reject
════════════════════════════════════════════ */
export function SectionRefunds() {
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [filter, setFilter]   = useState('all')

  const loadRequests = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await api.getNewRequests()
      setList(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  /* ── Approve refund ── */
  const handleApprove = async (id) => {
    setError('')
    setActionLoading(id + '_approve')
    try {
      await api.approveRefund(id)
      setList(l => l.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading('')
    }
  }

  /* ── Reject booking ── */
  const handleReject = async (id) => {
    setError('')
    setActionLoading(id + '_reject')
    try {
      await api.rejectBooking(id)
      setList(l => l.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading('')
    }
  }

  const STATUSES = ['all', 'pending', 'approved', 'rejected']
  const STATUS_LBL = { all: 'Tất cả', pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' }

  const filtered = list.filter(r => filter === 'all' || r.status === filter)

  return (
    <div className="adm-fade">
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Yêu cầu hoàn vé</div>
          <div className="adm-sec-sub">{list.filter(r => r.status === 'pending').length} đang chờ xử lý</div>
        </div>
        <button className="adm-btn adm-btn-ghost" onClick={loadRequests}>↻ Làm mới</button>
      </div>

      {error && <ErrBox msg={error} onRetry={loadRequests} />}

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-chips">
            {STATUSES.map(s => (
              <div key={s} className={`adm-chip ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>
                {STATUS_LBL[s]}
              </div>
            ))}
          </div>
        </div>
        <div className="adm-scroll">
          {loading ? <Spinner /> : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th><th>Khách hàng</th><th>Booking ID</th>
                  <th>Lý do</th><th>Trạng thái</th><th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="adm-empty">Không có yêu cầu nào</div></td></tr>
                ) : filtered.map(r => (
                  <tr key={r.id}>
                    <td><span className="adm-mono">{r.id}</span></td>
                    <td>{r.customer_name || r.user?.name || r.user_id || '—'}</td>
                    <td><span className="adm-mono" style={{ color: 'var(--accent2)' }}>{r.booking_id}</span></td>
                    <td style={{ maxWidth: 200, fontSize: 12 }}>{r.reason || '—'}</td>
                    <td><Badge value={r.status || 'pending'} /></td>
                    <td>
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="adm-btn adm-btn-primary adm-btn-sm"
                            disabled={actionLoading === r.id + '_approve'}
                            onClick={() => handleApprove(r.id)}
                          >
                            {actionLoading === r.id + '_approve' ? '...' : '✓ Duyệt'}
                          </button>
                          <button
                            className="adm-btn adm-btn-danger adm-btn-sm"
                            disabled={actionLoading === r.id + '_reject'}
                            onClick={() => handleReject(r.id)}
                          >
                            {actionLoading === r.id + '_reject' ? '...' : '✕ Từ chối'}
                          </button>
                        </div>
                      )}
                      {r.status !== 'pending' && (
                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}