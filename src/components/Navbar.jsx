import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { StickyNote, Settings, LogOut, Sun, Moon } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <StickyNote className="w-8 h-8 text-amber-500" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              Noty
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {user && (
              <>
                {/* Settings link */}
                <Link
                  to="/settings"
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    location.pathname === '/settings'
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : ''
                  }`}
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* User email */}
                <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 ml-2">
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
