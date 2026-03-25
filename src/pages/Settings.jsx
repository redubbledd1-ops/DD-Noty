import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { themeConfig } from '../config/theme'
import { User, Shield, Palette, RotateCcw } from 'lucide-react'

const Settings = () => {
  const { colors, updateColor, resetTheme } = useTheme()
  const { user } = useAuth()

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: themeConfig.text.primary }}>
        Settings
      </h1>

      {/* Settings sections */}
      <div className="space-y-4 sm:space-y-6">
        {/* Account section */}
        <section className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: themeConfig.background.note, borderColor: themeConfig.border.default, borderWidth: '1px' }}>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5" style={{ color: themeConfig.text.secondary }} />
            <h2 className="text-lg font-semibold" style={{ color: themeConfig.text.primary }}>
              Account
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span style={{ color: themeConfig.text.secondary }}>Email</span>
              <span style={{ color: themeConfig.text.primary }} className="font-medium">
                {user?.email}
              </span>
            </div>
          </div>
        </section>

        {/* Appearance section - Theme Colors */}
        <section className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: themeConfig.background.note, borderColor: themeConfig.border.default, borderWidth: '1px' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5" style={{ color: themeConfig.text.secondary }} />
              <h2 className="text-lg font-semibold" style={{ color: themeConfig.text.primary }}>
                Theme Colors
              </h2>
            </div>
            <button
              onClick={resetTheme}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
          <div className="space-y-4">
            {/* Background Color */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-3 sm:gap-0">
              <div>
                <span className="text-gray-600 dark:text-gray-300 block font-medium text-sm sm:text-base">
                  Background
                </span>
                <span className="text-xs sm:text-sm text-gray-400">
                  Main app background
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors.background}
                  onChange={(e) => updateColor('background', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {colors.background}
                </span>
              </div>
            </div>

            {/* Note Background Color */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-3 sm:gap-0">
              <div>
                <span className="text-gray-600 dark:text-gray-300 block font-medium text-sm sm:text-base">
                  Note Background
                </span>
                <span className="text-xs sm:text-sm text-gray-400">
                  Note card background
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors.noteBackground}
                  onChange={(e) => updateColor('noteBackground', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {colors.noteBackground}
                </span>
              </div>
            </div>

            {/* Header Background Color */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-3 sm:gap-0">
              <div>
                <span className="text-gray-600 dark:text-gray-300 block font-medium text-sm sm:text-base">
                  Header Background
                </span>
                <span className="text-xs sm:text-sm text-gray-400">
                  Header/navigation background
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors.headerBackground}
                  onChange={(e) => updateColor('headerBackground', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {colors.headerBackground}
                </span>
              </div>
            </div>

            {/* Text Color */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-3 sm:gap-0">
              <div>
                <span className="text-gray-600 dark:text-gray-300 block font-medium text-sm sm:text-base">
                  Text Color
                </span>
                <span className="text-xs sm:text-sm text-gray-400">
                  Primary text color
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors.textColor}
                  onChange={(e) => updateColor('textColor', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {colors.textColor}
                </span>
              </div>
            </div>

            {/* Secondary Text Color */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-3 sm:gap-0">
              <div>
                <span className="text-gray-600 dark:text-gray-300 block font-medium text-sm sm:text-base">
                  Secondary Text
                </span>
                <span className="text-xs sm:text-sm text-gray-400">
                  Secondary/muted text
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors.textSecondary}
                  onChange={(e) => updateColor('textSecondary', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {colors.textSecondary}
                </span>
              </div>
            </div>

            {/* Border Color */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-3 sm:gap-0">
              <div>
                <span className="text-gray-600 dark:text-gray-300 block font-medium text-sm sm:text-base">
                  Border Color
                </span>
                <span className="text-xs sm:text-sm text-gray-400">
                  Borders and dividers
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors.borderColor}
                  onChange={(e) => updateColor('borderColor', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {colors.borderColor}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy section */}
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
