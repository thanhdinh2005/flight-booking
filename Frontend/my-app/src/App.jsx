
import { useState }                                    from 'react'
import { BrowserRouter, Routes, Route, Navigate }      from 'react-router-dom'

import Home           from './components/Home'
import Login          from './components/Login'
import Register       from './components/Register'
import ProtectedRoute from './components/protected'
import AdminDashboard from './admin/AdminDashboard'

import './styles/signup.css'

/* ── Trang Auth: chứa Login / Register / ForgotPassword ── */
function AuthPage() {
  const [page, setPage] = useState('login')

  return (
    <div className="auth-page">
      {page === 'register'
        ? <Register onNavigate={setPage} />
        : <Login    onNavigate={setPage} />
      }
    </div>
  )
}

/* ── Trang không có quyền ── */
function Unauthorized() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16,
      fontFamily:"'Be Vietnam Pro', sans-serif", background:'#e8f7fd'
    }}>
      <span style={{fontSize:64}}>⛔</span>
      <h2 style={{color:'#1a3a4a'}}>Không có quyền truy cập</h2>
      <p style={{color:'#4a7a90'}}>Tài khoản của bạn không có quyền vào trang này.</p>
      <a href="/login" style={{color:'#1a9a8e', fontWeight:600}}>← Quay lại đăng nhập</a>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   App – Router gốc
═══════════════════════════════════════════════ */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login"        element={<AuthPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Customer – bất kỳ user đã đăng nhập không phải admin */}
        <Route
          path="/home"
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}