import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { StickyNote, Settings, LogOut } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { colors } = useTheme()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav 
      className="shadow-md sticky top-0 z-50"
      style={{ backgroundColor: 'var(--header-bg)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <StickyNote className="w-8 h-8 text-amber-500" />
            <span 
              className="text-xl font-bold"
              style={{ color: 'var(--text-color)' }}
            >
              Noty
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {user && (
              <>
                {/* Settings link */}
                <Link
                  to="/settings"
                  className="p-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: location.pathname === '/settings' ? colors.borderColor : 'transparent',
                  }}
                  aria-label="Settings"
                >
                  <Settings 
                    className="w-5 h-5"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full transition-colors hover:opacity-80"
                  aria-label="Logout"
                >
                  <LogOut 
                    className="w-5 h-5"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </button>

                {/* User email */}
                <span 
                  className="hidden sm:block text-sm ml-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {user.email}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
