import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useScrollHeader } from '../hooks/useScrollHeader'
import { themeConfig } from '../config/theme'
import { StickyNote, Settings, LogOut, Tag } from 'lucide-react'

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
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <StickyNote className="w-5 sm:w-6 md:w-8 h-5 sm:h-6 md:h-8 text-amber-500" />
            <span 
              className="text-base sm:text-lg md:text-xl font-bold"
              style={{ color: themeConfig.text.primary }}
            >
              Noty
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
            {user && (
              <>
                {/* Categories link */}
                <Link
                  to="/categories"
                  className="p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0"
                  style={{
                    backgroundColor: location.pathname === '/categories' ? colors.borderColor : 'transparent',
                  }}
                  aria-label="Categories"
                >
                  <Tag 
                    className="w-4 sm:w-5 h-4 sm:h-5"
                    style={{ color: themeConfig.text.secondary }}
                  />
                </Link>

                {/* Settings link */}
                <Link
                  to="/settings"
                  className="p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0"
                  style={{
                    backgroundColor: location.pathname === '/settings' ? colors.borderColor : 'transparent',
                  }}
                  aria-label="Settings"
                >
                  <Settings 
                    className="w-5 h-5"
                    style={{ color: themeConfig.text.secondary }}
                  />
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 rounded-full transition-colors hover:opacity-80 flex-shrink-0"
                  aria-label="Logout"
                >
                  <LogOut 
                    className="w-4 sm:w-5 h-4 sm:h-5"
                    style={{ color: themeConfig.text.secondary }}
                  />
                </button>

                {/* User email */}
                <span 
                  className="hidden md:block text-xs ml-1 lg:ml-2 truncate max-w-[120px]"
                  style={{ color: themeConfig.text.secondary }}
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
