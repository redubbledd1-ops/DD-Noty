import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { Sun, Moon, Bell, User, Shield } from 'lucide-react'

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Settings
      </h1>

      {/* Settings sections */}
      <div className="space-y-6">
        {/* Account section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Account
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600 dark:text-gray-300">Email</span>
              <span className="text-gray-800 dark:text-white font-medium">
                {user?.email}
              </span>
            </div>
          </div>
        </section>

        {/* Appearance section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            {darkMode ? (
              <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Appearance
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-gray-600 dark:text-gray-300 block">
                  Dark Mode
                </span>
                <span className="text-sm text-gray-400">
                  Toggle between light and dark theme
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  darkMode ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    darkMode ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Notifications section (future-ready) */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Notifications
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-gray-600 dark:text-gray-300 block">
                  Push Notifications
                </span>
                <span className="text-sm text-gray-400">
                  Get notified about reminders
                </span>
              </div>
              <span className="text-sm text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                Coming soon
              </span>
            </div>
          </div>
        </section>

        {/* Privacy section (future-ready) */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Privacy & Security
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your notes are stored securely in Firebase and are only accessible
              by you. Each user can only read and write their own notes.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
