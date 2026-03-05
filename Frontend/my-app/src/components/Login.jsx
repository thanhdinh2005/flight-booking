import React, { useState } from 'react'
import { loginKeycloak, saveToken } from '../services/keycloakService'

export default function Login({ onNavigate, onLoginSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tokenData = await loginKeycloak(form.email, form.password)
      saveToken(tokenData)
      onLoginSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-card login-card">
      <h2 className="title">Đăng nhập</h2>
      <form className="form" onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email..." value={form.email} onChange={handleChange} className="input" required />
        <input name="password" type="password" placeholder="Mật khẩu..." value={form.password} onChange={handleChange} className="input" required />

        {error && <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '6px' }}>{error}</p>}

        <div style={{ textAlign: 'right', marginTop: '6px' }}>
          <button type="button" className="link" onClick={() => onNavigate('forgot')}>Quên mật khẩu</button>
        </div>

        <button type="submit" className="btn" style={{ marginTop: '1.8rem' }} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 600 }}>
          Bạn chưa có tài khoản?{' '}
          <button type="button" className="link" onClick={() => onNavigate('register')}>Đăng ký ngay</button>
        </p>
      </form>
    </div>
  )
}