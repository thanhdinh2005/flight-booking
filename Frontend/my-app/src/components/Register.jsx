import React, { useState } from 'react'

export default function Register({ initial = {}, onContinue, onBack }) {
  const [form, setForm] = useState({
    email: initial.email || '',
    phone: initial.phone || '',
    username: initial.username || '',
    region: initial.region || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const submit = (e) => {
    e.preventDefault()
    onContinue(form)
  }

  return (
    <div className="signup-card">
      <h2 className="title">Đăng ký</h2>

      <form className="form" onSubmit={submit}>
        <input name="email" type="email" placeholder="Email..." value={form.email} onChange={handleChange} className="input" required />
        <input name="phone" type="tel" placeholder="Số điện thoại..." value={form.phone} onChange={handleChange} className="input" required />
        <input name="username" type="text" placeholder="Username..." value={form.username} onChange={handleChange} className="input" required />

        <div className="select-wrapper">
          <select name="region" value={form.region} onChange={handleChange} className="select" required>
            <option value="">Chọn mã vùng</option>
            <option value="VN">+84 (Vietnam)</option>
            <option value="US">+1 (USA)</option>
            <option value="JP">+81 (Japan)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '1rem' }}>
          <button type="button" className="btn" onClick={onBack} style={{ background: '#9aa' }}>Quay lại</button>
          <button type="submit" className="btn">Tiếp tục</button>
        </div>
      </form>
    </div>
  )
}
