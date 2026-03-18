import React, { useState } from 'react'
import '../styles/signup.css'

const REGION_PREFIX = { VN: '+84', US: '+1', JP: '+81' }

export default function RegisterForm({ onNavigate, onRegister }) {
  const [step, setStep] = useState(1)
  const [info, setInfo] = useState({ email: '', phone: '', username: '', region: 'VN' })
  const [form, setForm] = useState({
    firstName: '', lastName: '', password: '', confirmPassword: '', agree: false,
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  /* ── Step 1 ── */
  const handleInfo = (e) => {
    const { name, value } = e.target
    setInfo(f => ({ ...f, [name]: value }))
  }

  const submitStep1 = (e) => {
    e.preventDefault()
    setError('')
    if (!/^\d{7,15}$/.test(info.phone.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ (7–15 chữ số)')
      return
    }
    setStep(2)
  }

  /* ── Step 2 ── */
  const handleForm = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const pwChecks = {
    minLen:    form.password.length >= 8,
    hasUpper:  /[A-Z]/.test(form.password),
    hasNumber: /[0-9]/.test(form.password),
  }
  const validPw   = Object.values(pwChecks).every(Boolean)
  const pwMatch   = form.password !== '' && form.password === form.confirmPassword
  const canSubmit = validPw && pwMatch && form.agree && form.firstName && form.lastName

  const submitStep2 = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setError('')
    setLoading(true)

    const prefix    = REGION_PREFIX[info.region] || ''
    const fullPhone = `${prefix}${info.phone.replace(/^0/, '')}`

    const payload = {
      email:        info.email,
      password:     form.password,
      first_name:   form.firstName,
      last_name:    form.lastName,
      phone_number: fullPhone,
    }

    try {
      const res = await fetch('https://backend.test/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Lỗi ${res.status}`)
      }
      setSuccess(true)
      setTimeout(() => onRegister?.(), 2500)
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rg-card">

      {/* ── Header ── */}
      <div className="rg-header">
        <div className="rg-header-title">Đăng ký tài khoản</div>
        <div className="rg-header-sub">Vui lòng điền đầy đủ thông tin bên dưới</div>

        <div className="rg-steps">
          <div className={`rg-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <div className="rg-step-dot">{step > 1 ? '✓' : '1'}</div>
            <span>Thông tin liên hệ</span>
          </div>
          <div className="rg-step-line" />
          <div className={`rg-step ${step >= 2 ? 'active' : ''}`}>
            <div className="rg-step-dot">2</div>
            <span>Tài khoản &amp; mật khẩu</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="rg-body">

        {success ? (

          <div className="rg-success">
            <div className="rg-success-icon">✓</div>
            <h2>Đăng ký thành công!</h2>
            <p>Đang chuyển về trang đăng nhập...</p>
          </div>

        ) : step === 1 ? (

          /* ────── STEP 1 ────── */
          <form onSubmit={submitStep1}>
            <div className="rg-section">Thông tin liên hệ</div>

            <div className="rg-field">
              <label className="rg-label">Email <span className="rg-req">*</span></label>
              <input
                name="email" type="email" className="rg-input"
                placeholder="example@email.com"
                value={info.email} onChange={handleInfo} required
              />
            </div>

            <div className="rg-field">
              <label className="rg-label">Số điện thoại <span className="rg-req">*</span></label>
              <div className="rg-row">
                <div className="rg-field-short">
                  <select name="region" className="rg-select"
                    value={info.region} onChange={handleInfo}>
                    <option value="VN">🇻🇳 +84</option>
                    <option value="US">🇺🇸 +1</option>
                    <option value="JP">🇯🇵 +81</option>
                  </select>
                </div>
                <div className="rg-field">
                  <input
                    name="phone" type="tel" className="rg-input"
                    placeholder="9x xxx xxxx"
                    value={info.phone} onChange={handleInfo} required
                  />
                </div>
              </div>
            </div>

            <div className="rg-field">
              <label className="rg-label">Username <span className="rg-req">*</span></label>
              <input
                name="username" type="text" className="rg-input"
                placeholder="Tên đăng nhập"
                value={info.username} onChange={handleInfo} required
              />
            </div>

            {error && <div className="rg-error">⚠️ {error}</div>}

            <div className="rg-actions">
              <button type="button" className="rg-btn rg-btn-secondary" onClick={() => onNavigate('login')}>
                Quay lại
              </button>
              <button type="submit" className="rg-btn rg-btn-primary">
                Tiếp tục →
              </button>
            </div>
          </form>

        ) : (

          /* ────── STEP 2 ────── */
          <form onSubmit={submitStep2}>
            <div className="rg-section">Họ &amp; tên</div>

            <div className="rg-row">
              <div className="rg-field">
                <label className="rg-label">Họ <span className="rg-req">*</span></label>
                <input
                  name="lastName" className="rg-input"
                  placeholder="Nguyễn"
                  value={form.lastName} onChange={handleForm} required
                />
              </div>
              <div className="rg-field">
                <label className="rg-label">Tên <span className="rg-req">*</span></label>
                <input
                  name="firstName" className="rg-input"
                  placeholder="Văn A"
                  value={form.firstName} onChange={handleForm} required
                />
              </div>
            </div>

            <hr className="rg-divider" />
            <div className="rg-section">Mật khẩu</div>

            <div className="rg-field">
              <label className="rg-label">Mật khẩu <span className="rg-req">*</span></label>
              <input
                name="password" type="password" className="rg-input"
                placeholder="Nhập mật khẩu"
                value={form.password} onChange={handleForm} required
              />
              <ul className="pw-checks">
                <li className={pwChecks.minLen ? 'ok' : ''}>
                  <span className="pw-dot">{pwChecks.minLen ? '✓' : ''}</span>
                  Ít nhất 8 ký tự
                </li>
                <li className={pwChecks.hasUpper ? 'ok' : ''}>
                  <span className="pw-dot">{pwChecks.hasUpper ? '✓' : ''}</span>
                  Có ít nhất 1 chữ hoa
                </li>
                <li className={pwChecks.hasNumber ? 'ok' : ''}>
                  <span className="pw-dot">{pwChecks.hasNumber ? '✓' : ''}</span>
                  Có ít nhất 1 chữ số
                </li>
              </ul>
            </div>

            <div className="rg-field">
              <label className="rg-label">Nhắc lại mật khẩu <span className="rg-req">*</span></label>
              <input
                name="confirmPassword" type="password" className="rg-input"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword} onChange={handleForm} required
              />
              {form.confirmPassword !== '' && (
                <ul className="pw-checks">
                  <li className={pwMatch ? 'ok' : 'err'}>
                    <span className="pw-dot">{pwMatch ? '✓' : '✗'}</span>
                    {pwMatch ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}
                  </li>
                </ul>
              )}
            </div>

            <label className="rg-agree">
              <input name="agree" type="checkbox" checked={form.agree} onChange={handleForm} />
              Tôi đồng ý với <a href="#">điều khoản sử dụng</a>
            </label>

            {error && <div className="rg-error" style={{ marginTop: 14 }}>⚠️ {error}</div>}

            <div className="rg-actions">
              <button
                type="button" className="rg-btn rg-btn-secondary"
                onClick={() => { setStep(1); setError('') }}
                disabled={loading}
              >
                ← Quay lại
              </button>
              <button
                type="submit" className="rg-btn rg-btn-primary"
                disabled={!canSubmit || loading}
              >
                {loading ? '⏳ Đang đăng ký...' : 'Đăng ký tài khoản'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}