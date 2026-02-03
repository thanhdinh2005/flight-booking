import React, { useState } from 'react'

export default function Login({ onNavigate }) {
  const [form, setForm] = useState({ email: '', phone: '', password: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // placeholder login
    console.log('Login attempt', form)
    alert('Đăng nhập (demo). Kiểm tra console.')
  }

  return (
    <div className="signup-card login-card">
      <h2 className="title">Đăng nhập</h2>

      <form className="form" onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email..." value={form.email} onChange={handleChange} className="input" required />
        <input name="phone" type="tel" placeholder="Số điện thoại ..." value={form.phone} onChange={handleChange} className="input" />
        <input name="password" type="password" placeholder="Mật khẩu..." value={form.password} onChange={handleChange} className="input" required />

        <div style={{ textAlign: 'right', marginTop: '6px' }}>
          <button type="button" className="link" onClick={() => onNavigate('forgot')}>Quên mật khẩu</button>
        </div>

        <button type="submit" className="btn" style={{ marginTop: '1.8rem' }}>Đăng nhập</button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 600 }}>
          Bạn chưa có tài khoản ? <button type="button" className="link" onClick={() => onNavigate('register')}>Đăng ký ngay</button>
        </p>
      </form>
    </div>
  )
}
