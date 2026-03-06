import React from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated, hasRole } from '../services/keycloakService'

/**
 * Bảo vệ route khỏi người dùng chưa đăng nhập hoặc không đủ quyền
 *
 * Dùng:
 *   <ProtectedRoute>                          → chỉ cần đăng nhập
 *   <ProtectedRoute requiredRole="ADMIN">     → cần role ADMIN
 *   <ProtectedRoute requiredRole={['ADMIN','STAFF']}> → 1 trong 2 role
 */
export default function ProtectedRoute({ children, requiredRole }) {
  // Chưa đăng nhập → về trang login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Kiểm tra role nếu có yêu cầu
  if (requiredRole) {
    const allowed    = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const hasAccess  = allowed.some((r) => hasRole(r))
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}