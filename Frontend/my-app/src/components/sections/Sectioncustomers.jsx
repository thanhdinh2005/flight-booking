import { useState, useEffect } from 'react'
import Badge from '../badge'
import Modal from '../model'
import api from './api'
import { Spinner, ErrBox } from './Shared'

/* ════════════════════════════════════════════
   SECTION: CUSTOMERS
   API: GET /admin/users, POST, PUT disable/active
════════════════════════════════════════════ */
export function SectionCustomers() {
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [modal, setModal]     = useState(false)
  const [actionLoading, setActionLoading] = useState('')  // id đang xử lý
  const [form, setForm]       = useState({ email: '', password: '', first_name: '', last_name: '', phone_number: '' })

  /* ── Load all users ── */
  const loadUsers = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await api.getAllUsers()
      setList(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  /* ── Search by email ── */
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQ.trim()) return loadUsers()
    setError('')
    setLoading(true)
    try {
      const data = await api.searchUser(searchQ)
      setList(Array.isArray(data) ? data : [data])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── Disable user ── */
  const handleDisable = async (id) => {
    setError('')
    setActionLoading(id)
    try {
      await api.disableUser(id)
      setList(l => l.map(u => u.id === id ? { ...u, status: 'suspended' } : u))
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading('')
    }
  }

  /* ── Activate user ── */
  const handleActivate = async (id) => {
    setError('')
    setActionLoading(id)
    try {
      await api.activateUser(id)
      setList(l => l.map(u => u.id === id ? { ...u, status: 'active' } : u))
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading('')
    }
  }

  /* ── Create user ── */
  const handleCreate = async () => {
    setError('')
    setLoading(true)
    try {
      const newUser = await api.createUser(form)
      setList(l => [...l, newUser])
      setModal(false)
      setForm({ email: '', password: '', first_name: '', last_name: '', phone_number: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── Filter local ── */
  const filtered = list.filter(u =>
    !search ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.last_name  || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="adm-fade">
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Quản lý khách hàng</div>
          <div className="adm-sec-sub">{list.length} người dùng</div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setModal(true)}>+ Tạo user</button>
      </div>

      {error && <ErrBox msg={error} onRetry={loadUsers} />}

      <div className="adm-card">
        {/* Search bar — gọi API search */}
        <div className="adm-toolbar" style={{ gap: 8 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input
              className="adm-search"
              placeholder="🔍 Nhập email để tìm kiếm..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            <button type="submit" className="adm-btn adm-btn-ghost">Tìm</button>
            <button type="button" className="adm-btn adm-btn-ghost" onClick={() => { setSearchQ(''); loadUsers() }}>Xoá</button>
          </form>
          {/* Filter local theo tên */}
          <input
            className="adm-search"
            style={{ maxWidth: 200 }}
            placeholder="Lọc theo tên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="adm-scroll">
          {loading ? <Spinner /> : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th><th>Họ tên</th><th>Email</th>
                  <th>Điện thoại</th><th>Trạng thái</th><th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="adm-empty">Không tìm thấy user nào</div></td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id}>
                    <td><span className="adm-mono">{u.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{u.first_name} {u.last_name}</td>
                    <td><span className="adm-mono">{u.email}</span></td>
                    <td><span className="adm-mono">{u.phone_number || '—'}</span></td>
                    <td><Badge value={u.status || 'active'} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(u.status === 'active' || !u.status) ? (
                          <button
                            className="adm-btn adm-btn-ghost adm-btn-sm"
                            disabled={actionLoading === u.id}
                            onClick={() => handleDisable(u.id)}
                          >
                            {actionLoading === u.id ? '...' : 'Khóa'}
                          </button>
                        ) : (
                          <button
                            className="adm-btn adm-btn-ghost adm-btn-sm"
                            disabled={actionLoading === u.id}
                            onClick={() => handleActivate(u.id)}
                          >
                            {actionLoading === u.id ? '...' : 'Mở khóa'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal tạo user mới */}
      {modal && (
        <Modal
          title="Tạo user mới"
          sub="POST /admin/users"
          onClose={() => setModal(false)}
          footer={<>
            <button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)}>Hủy</button>
            <button className="adm-btn adm-btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo user'}
            </button>
          </>}
        >
          {[
            ['first_name',   'Tên',          'text',     'Văn A'],
            ['last_name',    'Họ',           'text',     'Nguyễn'],
            ['email',        'Email',        'email',    'user@mail.com'],
            ['password',     'Mật khẩu',    'password', '••••••••'],
            ['phone_number', 'Điện thoại',  'text',     '+84 9xx xxx xxx'],
          ].map(([k, l, t, p]) => (
            <div className="adm-field" key={k}>
              <label className="adm-label">{l}</label>
              <input
                className="adm-input" type={t} placeholder={p}
                value={form[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              />
            </div>
          ))}
          {error && <ErrBox msg={error} />}
        </Modal>
      )}
    </div>
  )
}