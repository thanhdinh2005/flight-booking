import { useNavigate } from 'react-router-dom'
import {
  getToken,
  getUserFromToken,
  isAuthenticated,
  hasRole,
  logoutKeycloak,
} from '../services/keycloakService'

/**
 * Hook dùng trong bất kỳ component nào cần thông tin user / quyền
 *
 * const { user, isAdmin, isStaff, isCustomer, logout } = useAuth()
 */
export function useAuth() {
  const navigate = useNavigate()
  const token    = getToken()
  const user     = token ? getUserFromToken(token) : null

  const logout = async () => {
    await logoutKeycloak()
    navigate('/login', { replace: true })
  }

  return {
    user,                     
    isAuthenticated: isAuthenticated(),
    isAdmin:         hasRole('ADMIN'),
    isStaff:         hasRole('STAFF'),
    isCustomer:      hasRole('CUSTOMER'),
    logout,
  }
}