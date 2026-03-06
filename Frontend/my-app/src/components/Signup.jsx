import React, { useState } from 'react'
import Login    from './Login'
import Register from './Register'
import '../styles/signup.css'

/**
 * Auth wrapper — điều phối flow:
 *   login  ←→  register  →  (done)  →  login
 *
 * Layout: form bên trái, chữ Whisper bên phải.
 * Khi flow === 'register', ẩn tagline (card register rộng hơn).
 */
export default function Signup() {
  const [flow, setFlow] = useState('login')
  const showTagline = flow === 'login' || flow === 'forgot'

  return (
    <div className="signup-wrapper">

      {/* ── CỘT TRÁI: form ── */}
      <div className="auth-area">

        {flow === 'login' && (
          <Login
            onNavigate={(f) => {
              if (f === 'register') setFlow('register')
              if (f === 'forgot')   setFlow('forgot')
            }}
          />
        )}

        {flow === 'register' && (
          <Register
            onBack={() => setFlow('login')}
            onRegister={() => setFlow('login')}
          />
        )}

        {flow === 'forgot' && (
          <div className="signup-card">
            <h2 className="title">Quên mật khẩu</h2>
            <p style={{ color: 'var(--text-mid)', marginTop: '0.5rem', fontSize: '0.88rem' }}>
              Chức năng quên mật khẩu chưa được triển khai.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
              <button className="btn" onClick={() => setFlow('login')}>Quay lại đăng nhập</button>
            </div>
          </div>
        )}

      </div>

      {/* ── CỘT PHẢI: tagline Whisper ── */}
      {showTagline && (
        <div className="tagline-panel" aria-hidden>
          <p className="login-tagline">
            Hãy chọn điểm đến<br />
            Tôi sẽ đưa bạn đi
          </p>
        </div>
      )}

    </div>
  )
}