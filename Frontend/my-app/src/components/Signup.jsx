import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'
import Details from './Details'

export default function Auth() {
  const [flow, setFlow] = useState('login') // 'login' | 'register' | 'details' | 'forgot'
  const [collected, setCollected] = useState({})

  const goToRegister = () => setFlow('register')
  const goToLogin = () => setFlow('login')
  const goToForgot = () => setFlow('forgot')

  const handleRegisterContinue = (data) => {
    setCollected((c) => ({ ...c, ...data }))
    setFlow('details')
  }

  const handleRegister = (data) => {
    // Final submit
    const payload = { ...collected, ...data }
    console.log('Final registration payload', payload)
    alert('Đăng ký thành công (demo). Kiểm tra console.')
    setFlow('login')
  }

  return (
    <div className="signup-wrapper">
      <div className="right-panel" aria-hidden>
        <p className="hero-line">Hãy chọn điểm đến</p>
        <p className="hero-line sub">Tôi sẽ đưa bạn đi</p>
      </div>

      <div className="auth-area">
        {flow === 'login' && <Login onNavigate={(f) => (f === 'register' ? goToRegister() : f === 'forgot' ? goToForgot() : null)} />}

        {flow === 'register' && (
          <>
            <Register initial={collected} onContinue={handleRegisterContinue} onBack={goToLogin} />
          </>
        )}

        {flow === 'details' && (
          <Details initial={collected} onRegister={handleRegister} onBack={() => setFlow('register')} />
        )}

        {flow === 'forgot' && (
          <div className="signup-card">
            <h2 className="title">Quên mật khẩu</h2>
            <p style={{ color: '#333' }}>Chức năng quên mật khẩu chưa được triển khai trong demo này.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button className="btn" onClick={goToLogin}>Quay lại</button>
              <button className="btn" onClick={goToRegister} style={{ background: '#9aa' }}>Đăng ký</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
