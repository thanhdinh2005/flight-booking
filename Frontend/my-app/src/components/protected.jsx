// src/components/protected.jsx
import { Navigate } from 'react-router-dom'
import {
  isAuthenticated,
  getToken,
  getUserFromToken,
} from '../services/keycloakService'

/**
 * ProtectedRoute – bảo vệ route theo role.
 *
 * requiredRole:
 *   'ADMIN'    → chỉ ADMIN vào được
 *   'STAFF'    → chỉ STAFF vào được
 *   'CUSTOMER' → user thường (không phải ADMIN/STAFF)
 *   undefined  → chỉ cần đăng nhập hợp lệ
 */
export default function ProtectedRoute({ children, requiredRole }) {
  // isAuthenticated() kiểm tra token còn hạn không (dùng token_expiry trong sessionStorage)
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  const token = getToken()
  const user  = getUserFromToken(token)
  if (!user) return <Navigate to="/login" replace />

  const roles = user.roles || []

  if (requiredRole === 'ADMIN') {
    // Chỉ ADMIN
    if (!roles.includes('ADMIN')) return <Navigate to="/unauthorized" replace />
  }

  if (requiredRole === 'STAFF') {
    // Chỉ STAFF
    if (!roles.includes('STAFF')) return <Navigate to="/unauthorized" replace />
  }

  if (requiredRole === 'CUSTOMER') {
    // Nếu là ADMIN → về trang admin
    if (roles.includes('ADMIN')) return <Navigate to="/admin" replace />
    // Nếu là STAFF → về trang staff
    if (roles.includes('STAFF')) return <Navigate to="/staff/dashboard" replace />
  }

  return children
}
