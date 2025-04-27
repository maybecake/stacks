import React, { createContext, useContext, useState, useEffect } from 'react'
import { Theme, themes } from '../themes'

/**
 * Theme Context & Provider
 * 
 * RESPONSIBILITIES:
 * 1. Manage theme state
 * 2. Handle theme persistence
 * 3. Apply theme variables to DOM
 * 4. Provide theme switching capability
 * 
 * IMPLEMENTATION NOTES:
 * - Uses localStorage for theme persistence
 * - Defaults to 'light' theme if no saved preference
 * - Applies theme variables to document.documentElement
 * 
 * USAGE:
 * 1. Wrap your app with ThemeProvider:
 *    <ThemeProvider><App /></ThemeProvider>
 * 
 * 2. Use theme in components:
 *    const { theme, setTheme } = useTheme();
 * 
 * SCALING CONSIDERATIONS:
 * 1. For SSR, consider hydration implications
 * 2. For performance, consider memoizing theme value
 * 3. For testing, consider adding a test provider
 */

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get saved theme from localStorage, default to light
    const savedTheme = localStorage.getItem('theme') as Theme
    return savedTheme && Object.keys(themes).includes(savedTheme) ? savedTheme : 'light'
  })

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme)
    
    // Apply theme variables to document root
    const root = document.documentElement
    const themeVariables = themes[theme]
    
    Object.entries(themeVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
} 