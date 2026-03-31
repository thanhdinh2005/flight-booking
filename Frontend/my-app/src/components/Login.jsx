// src/components/Login.jsx
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  loginKeycloak,
  saveToken,
  clearToken,
  getToken,
  isAuthenticated,
  getUserFromToken,
  redirectByRole,
} from '../services/keycloakService'
import '../styles/signup.css'


export default function Login({ onNavigate }) {
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) return
    const token = getToken()
    const user = token ? getUserFromToken(token) : null
    if (!user) return

    if (user.roles?.includes('ADMIN')) {
      clearToken()
      setError('Tài khoản quản trị không đăng nhập tại đây. ')
      return
    }

    redirectByRole(user.roles || [], navigate)
  }, [navigate])

  useEffect(() => {
    const authMessage = location.state?.authMessage
    if (!authMessage) return

    setError(authMessage)
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (error) setError('')
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tokenData = await loginKeycloak(form.email, form.password)
      const user = getUserFromToken(tokenData.access_token)

      if (user?.roles?.includes('ADMIN')) {
        clearToken()
        throw new Error('Tài khoản quản trị không đăng nhập tại đây')
      }

      saveToken(tokenData)
      redirectByRole(user?.roles || [], navigate)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-card">
      {/* Logo */}
   

      <h2 className="title">Đăng nhập</h2>
      <p className="title-sub">Chào mừng bạn quay trở lại</p>

      <form className="form" onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email..."
          value={form.email}
          onChange={handleChange}
          className="input"
          required
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          placeholder="Mật khẩu..."
          value={form.password}
          onChange={handleChange}
          className="input"
          required
          autoComplete="current-password"
        />

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: 4 }}>
            ⚠️ {error}
          </p>
        )}

        <div style={{ textAlign: 'right', marginTop: 4 }}>
          <button type="button" className="link" onClick={() => onNavigate?.('forgot')}>
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="submit"
          className="btn"
          style={{ marginTop: '1.4rem', width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-mid)' }}>
          Chưa có tài khoản?{' '}
          <button type="button" className="link" onClick={() => onNavigate?.('register')}>
            Đăng ký ngay
          </button>
        </p>
      </form>
    </div>
  )
}
