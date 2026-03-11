import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth           from './components/Signup'
import ProtectedRoute from './components/protected'
import './styles/signup.css'
import AdminDashboard from './admin/AdminDashboard'


// ── Placeholder pages (thay bằng trang thật của bạn) ──────────────────────────
const HomePage  = () => <div style={{ padding: 40, color: 'black' }}>🏠 Trang chủ (CUSTOMER)</div>
const AdminPage = () => <div style={{ padding: 40, color: 'black' }}>⚙️ Admin Dashboard</div>
const StaffPage = () => <div style={{ padding: 40, color: 'black' }}>🛠️ Staff Dashboard</div>
const Unauthorized = () => (
  <div style={{ padding: 40 }}>
    <h2>⛔ Không có quyền truy cập</h2>
    <a href="/login">Quay lại đăng nhập</a>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login"        element={<Auth />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* CUSTOMER */}
        <Route path="/home" element={
          <ProtectedRoute requiredRole="CUSTOMER">
            <HomePage />
          </ProtectedRoute>
        } />

        {/* STAFF */}
        <Route path="/staff/dashboard" element={
          <ProtectedRoute requiredRole="STAFF">
            <StaffPage />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
        <ProtectedRoute requiredRole="ADMIN">
          <AdminDashboard />
        </ProtectedRoute>
      } />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}