import React, { useState } from 'react'

export default function Details({ initial = {}, onRegister, onBack }) {
  const [form, setForm] = useState({
    ...initial,
    fullName: initial.fullName || '',
    idNumber: initial.idNumber || '',
    address: initial.address || '',
    gender: initial.gender || '',
    dob: initial.dob || '',
    nationality: initial.nationality || '',
    password: '',
    confirmPassword: '',
    agree: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const passwordChecks = {
    minLen: form.password.length >= 10,
    hasNumber: /[0-9]/.test(form.password),
    hasSpecial: /[^A-Za-z0-9]/.test(form.password),
  }

  const validPassword = Object.values(passwordChecks).every(Boolean)
  const passwordsMatch = form.password && form.password === form.confirmPassword
  const canRegister = validPassword && passwordsMatch && form.agree

  const submit = (e) => {
    e.preventDefault()
    if (!canRegister) return alert('Vui lòng hoàn tất thông tin và chấp nhận điều khoản')
    onRegister(form)
  }

  return (
    <div className="details-card">
      <h2 className="details-title">Thông tin cá nhân</h2>
      <form className="details-form" onSubmit={submit}>
        <div className="labels">
          <div>Thông tin cá nhân</div>
          <div>Khởi tạo mật khẩu</div>
        </div>

        <div className="fields">
          <div className="grid">
            <div className="col">
              <label>Họ và tên</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nhập họ và tên" className="input" required />

              <label>CMND/CCCD</label>
              <input name="idNumber" value={form.idNumber} onChange={handleChange} placeholder="Nhập như trên hộ chiếu" className="input" />

              <label>Địa chỉ</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Nhập nơi cư trú" className="input" />
            </div>

            <div className="col">
              <label>Giới tính</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="select">
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>

              <label>Ngày sinh</label>
              <input name="dob" value={form.dob} onChange={handleChange} type="date" className="input" />

              <label>Quốc tịch</label>
              <select name="nationality" value={form.nationality} onChange={handleChange} className="select">
                <option value="">Chọn quốc tịch</option>
                <option value="VN">Vietnam</option>
                <option value="US">United States</option>
                <option value="JP">Japan</option>
              </select>
            </div>

            <div className="col col-right">
              <label>Mật khẩu</label>
              <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Nhập mật khẩu" className="input" required />

              <label>Nhắc lại mật khẩu</label>
              <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type="password" placeholder="Nhập lại mật khẩu" className="input" required />

              <ul className="pw-checks">
                <li className={passwordChecks.minLen ? 'ok' : ''}>Mật khẩu ít nhất 10 ký tự</li>
                <li className={passwordChecks.hasNumber ? 'ok' : ''}>Bao gồm ít nhất 1 chữ số</li>
                <li className={passwordChecks.hasSpecial ? 'ok' : ''}>Bao gồm ký tự đặc biệt</li>
              </ul>

              <label className="agree"><input name="agree" type="checkbox" checked={form.agree} onChange={handleChange} /> Tôi đồng ý với các điều khoản</label>

              <div className="actions">
                <button type="button" className="btn" onClick={onBack} style={{ background: '#9aa' }}>Quay lại</button>
                <button type="submit" className="btn register" disabled={!canRegister}>Đăng ký tài khoản</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
