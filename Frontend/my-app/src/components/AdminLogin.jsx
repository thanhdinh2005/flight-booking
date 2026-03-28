import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loginKeycloak,
  saveToken,
  clearToken,
  getUserFromToken,
  getToken,
  isAuthenticated,
  redirectByRole,
} from '../services/keycloakService'
import '../styles/admin-login.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) return
    const token = getToken()
    const user = token ? getUserFromToken(token) : null
    if (!user) return
    redirectByRole(user.roles || [], navigate)
  }, [navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tokenData = await loginKeycloak(form.email, form.password)
      saveToken(tokenData)
      const user = getUserFromToken(tokenData.access_token)

      if (!user?.roles?.includes('ADMIN')) {
        clearToken()
        throw new Error('Tài khoản này không có quyền truy cập trang quản trị.')
      }

      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="adm-login">
      <div className="adm-login__backdrop" />
      <div className="adm-login__shell">
        <section className="adm-login__aside">
          <div className="adm-login__kicker">VietJett Control Center</div>
          <h1 className="adm-login__title">Đăng nhập quản trị</h1>
          <p className="adm-login__desc">
            Khu vực này dành riêng cho quản trị viên theo dõi vận hành, tài khoản và lịch bay.
          </p>
          <div className="adm-login__stats">
            <div className="adm-login__stat">
              <span className="adm-login__stat-num">24/7</span>
              <span className="adm-login__stat-label">Giám sát hệ thống</span>
            </div>
            <div className="adm-login__stat">
              <span className="adm-login__stat-num">ADMIN</span>
              <span className="adm-login__stat-label">Yêu cầu đúng phân quyền</span>
            </div>
          </div>
        </section>

        <section className="adm-login__panel">
          <div className="adm-login__brand">
            <div className="adm-login__brand-icon">✈</div>
            <div>
              <div className="adm-login__brand-name">VietJett Admin</div>
              <div className="adm-login__brand-sub">Secure operator access</div>
            </div>
          </div>

          <form className="adm-login__form" onSubmit={handleSubmit}>
            <label className="adm-login__label">
              Email quản trị
              <input
                name="email"
                type="email"
                className="adm-login__input"
                placeholder="admin@vietjett.vn"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </label>

            <label className="adm-login__label">
              Mật khẩu
              <input
                name="password"
                type="password"
                className="adm-login__input"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </label>

            {error && <div className="adm-login__error">⚠ {error}</div>}

            <button
              type="submit"
              className="adm-login__submit"
              disabled={loading}
            >
              {loading ? 'Đang xác thực...' : 'Vào trang quản trị'}
            </button>

            <button
              type="button"
              className="adm-login__link"
              onClick={() => navigate('/login')}
            >
              ← Chuyển sang đăng nhập khách hàng
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
