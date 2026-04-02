// src/components/Signup.jsx
// Wrapper điều phối flow auth: login ↔ register ↔ forgot
// Đây là component được mount tại route /login

import { useState } from 'react'
import Login    from './Login'
import Register from './Register'
import { forgotPassword } from '../services/keycloakService'
import '../styles/signup.css'

export default function Signup() {
  const [flow, setFlow] = useState('login')
  const [forgotModal, setForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')

  // tagline chỉ hiện khi ở màn login hoặc forgot
  const showTagline = flow === 'login'

  const openForgotModal = () => {
    setForgotModal(true)
    setForgotError('')
    setForgotMessage('')
  }

  const closeForgotModal = () => {
    setForgotModal(false)
    setForgotError('')
    setForgotMessage('')
    setForgotLoading(false)
  }

  const handleForgotPassword = async () => {
    const email = forgotEmail.trim().toLowerCase()
    if (!email) {
      setForgotError('Vui lòng nhập email để nhận liên kết khôi phục.')
      return
    }

    setForgotLoading(true)
    setForgotError('')
    try {
      const response = await forgotPassword(email)
      setForgotMessage(response?.message || 'Nếu email hợp lệ, hệ thống đã gửi link khôi phục. Vui lòng kiểm tra hộp thư.')
    } catch (err) {
      setForgotError(err.message || 'Không gửi được yêu cầu quên mật khẩu.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <>
      <div className="signup-wrapper">

      {/* ── Cột trái: form ── */}
      <div className="auth-area">

        {flow === 'login' && (
          <Login
            onNavigate={(f) => {
              // Login gọi onNavigate('register') hoặc onNavigate('forgot')
              if (f === 'register') setFlow('register')
              if (f === 'forgot')   openForgotModal()
            }}
          />
        )}

        {flow === 'register' && (
          <Register
            onBack={     () => setFlow('login') }   // nút "Quay lại" trong Register
            onRegister={ () => setFlow('login') }   // đăng ký xong → về login
          />
        )}

      </div>

      {/* ── Cột phải: tagline ── */}
      {showTagline && (
        <div className="tagline-panel" aria-hidden>
          <p className="login-tagline">
            Hãy chọn điểm đến<br />
            Tôi sẽ đưa bạn đi
          </p>
        </div>
      )}

      </div>

      {forgotModal && (
        <div className="forgot-overlay" onClick={(e) => e.target === e.currentTarget && closeForgotModal()}>
          <div className="forgot-modal forgot-modal--standalone">
            <button className="forgot-modal__close" onClick={closeForgotModal} aria-label="Đóng">
              ✕
            </button>

            <div className="forgot-modal__head">
              <div className="forgot-modal__title">Quên mật khẩu</div>
              <div className="forgot-modal__sub">Nhập email để nhận liên kết khôi phục</div>
            </div>

            <div className="forgot-modal__body">
              <div className="forgot-modal__intro">
                Nhập Gmail hoặc email đăng ký để hệ thống gửi liên kết đặt lại mật khẩu.
              </div>

              <div className="forgot-modal__field">
                <label className="forgot-modal__label">Email</label>
                <input
                  className="forgot-modal__input"
                  type="email"
                  placeholder="example@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value)
                    if (forgotError) setForgotError('')
                  }}
                  disabled={forgotLoading}
                  autoComplete="email"
                />
              </div>

              {forgotError && (
                <div className="forgot-modal__message forgot-modal__message--error">
                  {forgotError}
                </div>
              )}

              {forgotMessage && (
                <div className="forgot-modal__message forgot-modal__message--success">
                  {forgotMessage}
                </div>
              )}
            </div>

            <div className="forgot-modal__foot">
              <button className="forgot-modal__btn forgot-modal__btn--ghost" onClick={closeForgotModal} disabled={forgotLoading}>Đóng</button>
              <button className="forgot-modal__btn forgot-modal__btn--primary" onClick={handleForgotPassword} disabled={forgotLoading}>
                {forgotLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
