import { createContext, useContext, useState, useEffect } from 'react'

// Create theme context
const ThemeContext = createContext()

// Default theme colors
const DEFAULT_THEME = {
  background: '#000000',
  noteBackground: '#0f172a',
  headerBackground: '#020617',
  textColor: '#e5e7eb',
  textSecondary: '#9ca3af',
  borderColor: '#1e293b',
}

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or defaults
  const [colors, setColors] = useState(() => {
    const saved = localStorage.getItem('themeColors')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return DEFAULT_THEME
      }
    }
    return DEFAULT_THEME
  })

  // Update a single color
  const updateColor = (key, value) => {
    setColors(prev => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('themeColors', JSON.stringify(updated))
      return updated
    })
  }

  // Reset to defaults
  const resetTheme = () => {
    setColors(DEFAULT_THEME)
    localStorage.setItem('themeColors', JSON.stringify(DEFAULT_THEME))
  }

  // Apply colors to CSS variables
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--bg', colors.background)
    root.style.setProperty('--note-bg', colors.noteBackground)
    root.style.setProperty('--header-bg', colors.headerBackground)
    root.style.setProperty('--text-color', colors.textColor)
    root.style.setProperty('--text-secondary', colors.textSecondary)
    root.style.setProperty('--border-color', colors.borderColor)
  }, [colors])

  const value = {
    colors,
    updateColor,
    resetTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
