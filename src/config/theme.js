// Centralized theme configuration for consistent styling across the app
// Uses CSS variables as the source of truth

export const themeConfig = {
  // Text colors
  text: {
    primary: 'var(--text-color)',
    secondary: 'var(--text-secondary)',
  },
  
  // Background colors
  background: {
    main: 'var(--bg)',
    note: 'var(--note-bg)',
    header: 'var(--header-bg)',
  },
  
  // Border colors
  border: {
    default: 'var(--border-color)',
  },
  
  // Accent colors
  accent: {
    primary: '#f59e0b', // amber-500
    secondary: '#3b82f6', // blue-500
    danger: '#ef4444', // red-500
    success: '#10b981', // green-500
  },
}

// Tailwind class mappings for consistent styling
export const themeClasses = {
  // Text styling
  textPrimary: 'text-gray-800 dark:text-white',
  textSecondary: 'text-gray-600 dark:text-gray-300',
  textMuted: 'text-gray-500 dark:text-gray-400',
  
  // Background styling
  bgPrimary: 'bg-white dark:bg-gray-800',
  bgSecondary: 'bg-gray-50 dark:bg-gray-900',
  bgNote: 'bg-gray-900 dark:bg-gray-900',
  
  // Input styling
  input: 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors',
  
  // Button styling
  buttonPrimary: 'bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors',
  buttonSecondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors',
  
  // Border styling
  borderDefault: 'border-gray-200 dark:border-gray-700',
  
  // Card styling
  card: 'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700',
  
  // Heading styling
  heading1: 'text-2xl font-bold text-gray-800 dark:text-white',
  heading2: 'text-lg font-semibold text-gray-800 dark:text-white',
  heading3: 'text-base font-semibold text-gray-800 dark:text-white',
}

// Helper function to get theme value
export const getThemeValue = (path) => {
  const keys = path.split('.')
  let value = themeConfig
  for (const key of keys) {
    value = value[key]
    if (!value) return null
  }
  return value
}
