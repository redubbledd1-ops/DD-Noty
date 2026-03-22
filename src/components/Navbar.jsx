import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useScrollHeader } from '../hooks/useScrollHeader'
import { StickyNote, Settings, LogOut } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { colors } = useTheme()
  const location = useLocation()
  const { isHeaderVisible } = useScrollHeader()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav 
      className="shadow-md sticky top-0 z-50 transition-transform duration-300 ease-out"
      style={{
        backgroundColor: 'var(--header-bg)',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <StickyNote className="w-6 sm:w-8 h-6 sm:h-8 text-amber-500" />
            <span 
              className="text-lg sm:text-xl font-bold"
              style={{ color: 'var(--text-color)' }}
            >
              Noty
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user && (
              <>
                {/* Settings link */}
                <Link
                  to="/settings"
                  className="p-2 rounded-full transition-colors flex-shrink-0"
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
                  className="p-2 rounded-full transition-colors hover:opacity-80 flex-shrink-0"
                  aria-label="Logout"
                >
                  <LogOut 
                    className="w-5 h-5"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </button>

                {/* User email */}
                <span 
                  className="hidden sm:block text-xs sm:text-sm ml-2 truncate"
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
