import { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
  const { token, role } = useContext(AuthContext)
  const location = useLocation()

  if (!token) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to='/unauthorized' replace />
  }

  // If used as a layout route (no children), render nested routes via Outlet
  return children ?? <Outlet />
}

export default ProtectedRoute