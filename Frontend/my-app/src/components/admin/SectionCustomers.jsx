import { useState, useEffect } from 'react'
import Badge from '../badge'
import Modal from '../model'
import { INIT_CUSTOMERS } from './mockData'
import { customerAPI } from './adminAPI'

export function SectionCustomers() {
  const [list, setList]           = useState(INIT_CUSTOMERS)
  const [q, setQ]                 = useState('')
  const [modal, setModal]         = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  const [form, setForm]             = useState({ name: '', email: '', password: '', phone: '', role: 'customer' })
  const [formErrors, setFormErrors] = useState({})

  const getCreateInitialForm = () => ({ name: '', email: '', password: '', phone: '', role: 'customer' })

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await customerAPI.getAll()
      setList(data)
      setError('')
      setSuccess('')
    } catch (err) {
      setError('Lỗi tải danh sách: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = list.filter(c =>
    (c.name ?? '').toLowerCase().includes(q.toLowerCase()) ||
    (c.email ?? '').includes(q) ||
    String(c.id).includes(q)
  )

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isActiveStatus = (status) => String(status ?? '').trim().toLowerCase() === 'active'

  const validateForm = (data) => {
    const errors = {}
    if (!data.name?.trim()) errors.name = 'Họ tên không được trống'
    if (!data.email?.trim()) errors.email = 'Email không được trống'
    if (data.email && !validateEmail(data.email)) errors.email = 'Email không hợp lệ'
    if ('password' in data) {
      if (!data.password?.trim()) errors.password = 'Mật khẩu không được trống'
      else if (data.password.trim().length < 6) errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    if (data.phone && !/^[\d\s+\-()]*$/.test(data.phone)) errors.phone = 'Số điện thoại không hợp lệ'
    return errors
  }

  const splitNameForApi = (fullName) => {
    const parts = String(fullName ?? '').trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return { first_name: '', last_name: '' }
    if (parts.length === 1) return { first_name: parts[0], last_name: parts[0] }
    return {
      first_name: parts.slice(1).join(' '),
      last_name: parts[0],
    }
  }

  const toggle = async (id, currentStatus) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await customerAPI.toggleStatus(id, currentStatus)
      setList(l => l.map(c => c.id === id
        ? { ...c, status: isActiveStatus(c.status) ? 'disabled' : 'active' }
        : c
      ))
    } catch (err) {
      setError('Lỗi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const errors = validateForm(form)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return
    setLoading(true)
    setError('')
    setSuccess('')
    const { first_name, last_name } = splitNameForApi(form.name)
    const payload = {
      email: form.email.trim(),
      password: form.password.trim(),
      first_name,
      last_name,
      phone_number: form.phone.trim(),
      role: String(form.role ?? 'customer').toUpperCase(),
    }
    try {
      const result = await customerAPI.create(payload)
      if (result?.id) setList(l => [...l, result])
      else await fetchUsers()
      setModal(false)
      setForm(getCreateInitialForm())
      setFormErrors({})
    } catch (err) {
      setError('Lỗi thêm: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (customer) => {
    setEditModal({
      id:    customer.id,
      name:  customer.name,
      email: customer.email,
      phone: customer.phone,
      role:  customer.role ?? 'customer',
    })
    setError('')
    setSuccess('')
  }

  const handleSaveEdit = async () => {
    if (!editModal) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const response = await customerAPI.updateRole(editModal.id, editModal.role)
      setList(l => l.map(c => c.id === editModal.id ? {
        ...c,
        role: editModal.role,
      } : c))
      setSuccess(response?.message || 'Cập nhật role thành công')
      setEditModal(null)
    } catch (err) {
      setError(err.message || 'Cập nhật role thất bại')
    } finally {
      setLoading(false)
    }
  }

  const RoleBadge = ({ role }) => (
    <span style={{
      padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
      background: role === 'admin' ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.15)',
      color:      role === 'admin' ? '#a855f7'                : '#3b82f6',
    }}>
      {role === 'admin' ? '👑 Admin' : '👤 Customer'}
    </span>
  )

  return (
    <div className="adm-fade">
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Quản lý tài khoản</div>
          <div className="adm-sec-sub">{list.length} tài khoản</div>
        </div>
        <button
          className="adm-btn adm-btn-primary"
          onClick={() => { setModal(true); setForm(getCreateInitialForm()); setFormErrors({}); setError('') }}
          disabled={loading}
        >+ Thêm tài khoản</button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }} onClick={() => setError('')}>✕</button>
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'var(--success)', color: 'white', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>✓ {success}</span>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }} onClick={() => setSuccess('')}>✕</button>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-toolbar">
          <input className="adm-search" placeholder="🔍 Tìm tên, email, mã KH..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Mã KH</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Trạng thái</th>
                <th>Quyền</th>
                <th>Số vé</th>
                <th>Tham gia</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}><div className="adm-empty">{list.length === 0 ? 'Chưa có khách hàng' : 'Không tìm thấy'}</div></td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id}>
                    <td><span className="adm-mono">{c.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td><span className="adm-mono">{c.email}</span></td>
                    <td><span className="adm-mono">{c.phone || '-'}</span></td>
                    <td><Badge value={c.status} /></td>
                    <td><RoleBadge role={c.role} /></td>
                    <td>{c.tickets}</td>
                    <td><span className="adm-mono">{c.joined}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEdit(c)} disabled={loading} title="Sửa thông tin">✏️ Sửa</button>
                        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => toggle(c.id, c.status)} disabled={loading} title={isActiveStatus(c.status) ? 'Khóa tài khoản' : 'Mở tài khoản'}>
                          {isActiveStatus(c.status) ? '🔒 Khóa' : '🔓 Mở'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM */}
      {modal && (
        <Modal
          title="Thêm tài khoản" sub="Điền thông tin bên dưới"
          onClose={() => { setModal(false); setFormErrors({}) }}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => { setModal(false); setFormErrors({}) }} disabled={loading}>Hủy</button>
              <button className="adm-btn adm-btn-primary" onClick={handleAdd} disabled={loading}>{loading ? '⏳ Đang thêm...' : 'Thêm'}</button>
            </>
          }
        >
          {[['name','Họ tên','text','Nguyễn Văn A'],['email','Email','email','email@mail.com'],['password','Mật khẩu','password','Nhập mật khẩu'],['phone','Điện thoại','text','0986xxxxxx']].map(([k,l,t,p]) => (
            <div className="adm-field" key={k}>
              <label className="adm-label">{l}{(k==='name'||k==='email'||k==='password')&&<span style={{color:'var(--danger)'}}>*</span>}</label>
              <input
                className={`adm-input ${formErrors[k] ? 'adm-input-error' : ''}`}
                type={t} placeholder={p} value={form[k]}
                onChange={e => { setForm(f => ({...f,[k]:e.target.value})); if(formErrors[k]){const n={...formErrors};delete n[k];setFormErrors(n)} }}
                disabled={loading}
              />
              {formErrors[k] && <div style={{color:'var(--danger)',fontSize:'12px',marginTop:'4px'}}>{formErrors[k]}</div>}
            </div>
          ))}
          <div className="adm-field">
            <label className="adm-label">Quyền</label>
            <select className="adm-input" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} disabled={loading}>
              <option value="customer">👤 Customer</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>
        </Modal>
      )}

      {/* MODAL SỬA */}
      {editModal && (
        <Modal
          title="Chỉnh sửa tài khoản" sub={`Mã TK: ${editModal.id}`}
          onClose={() => { setEditModal(null) }}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => { setEditModal(null) }} disabled={loading}>Hủy</button>
              <button className="adm-btn adm-btn-primary" onClick={handleSaveEdit} disabled={loading}>{loading ? '⏳ Đang lưu...' : 'Lưu'}</button>
            </>
          }
        >
          {[['name','Họ tên','text'],['email','Email','email'],['phone','Điện thoại','text']].map(([k,l,t]) => (
            <div className="adm-field" key={k}>
              <label className="adm-label">{l}</label>
              <input
                className="adm-input"
                type={t} value={editModal[k] ?? ''}
                readOnly
                disabled
                style={{ opacity: 0.72, cursor: 'not-allowed' }}
              />
            </div>
          ))}
          <div className="adm-field">
            <label className="adm-label">Quyền</label>
            <select className="adm-input" value={editModal.role} onChange={e => setEditModal(m => ({...m, role: e.target.value}))} disabled={loading}>
              <option value="customer">👤 Customer</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  )
}
