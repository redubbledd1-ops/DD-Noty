import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import NotePage from './pages/NotePage'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import { useAuth } from './contexts/AuthContext'

// Layout component with navbar for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <Navbar />
      <main className="w-full">{children}</main>
    </div>
  )
}

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  if (user) {
    return <Navigate to="/" replace />
  }
  return children
}

// App routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Home />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/note/:noteId"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <NotePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}

export default App