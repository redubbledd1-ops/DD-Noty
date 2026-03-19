import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Protected route wrapper - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
