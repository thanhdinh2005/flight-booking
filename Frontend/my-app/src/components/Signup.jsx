// src/components/Signup.jsx
// Wrapper điều phối flow auth: login ↔ register ↔ forgot
// Đây là component được mount tại route /login

import { useState } from 'react'
import Login    from './Login'
import Register from './Register'
import '../styles/signup.css'

export default function Signup() {
  const [flow, setFlow] = useState('login')

  // tagline chỉ hiện khi ở màn login hoặc forgot
  const showTagline = flow === 'login' || flow === 'forgot'

  return (
    <div className="signup-wrapper">

      {/* ── Cột trái: form ── */}
      <div className="auth-area">

        {flow === 'login' && (
          <Login
            onNavigate={(f) => {
              // Login gọi onNavigate('register') hoặc onNavigate('forgot')
              if (f === 'register') setFlow('register')
              if (f === 'forgot')   setFlow('forgot')
            }}
          />
        )}

        {flow === 'register' && (
          <Register
            onBack={     () => setFlow('login') }   // nút "Quay lại" trong Register
            onRegister={ () => setFlow('login') }   // đăng ký xong → về login
          />
        )}

        {flow === 'forgot' && (
          <div className="signup-card">
            <div className="auth-logo"><span>✈️</span> Việt Jett</div>
            <h2 className="title">Quên mật khẩu</h2>
            <p style={{ color: 'var(--text-mid)', fontSize: '0.88rem', textAlign: 'center', marginTop: '0.5rem' }}>
              Chức năng này chưa được triển khai.
            </p>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button className="btn" style={{ width: '100%' }} onClick={() => setFlow('login')}>
                ← Quay lại đăng nhập
              </button>
            </div>
          </div>
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
  )
}