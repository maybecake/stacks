import React, { createContext, useContext, useState, useEffect } from 'react'
import { Theme, themes } from '../themes'
import { Compactness, compactnessThemes } from '../themes/compactness'

/**
 * Theme Context & Provider
 * 
 * RESPONSIBILITIES:
 * 1. Manage theme state (color and compactness)
 * 2. Handle theme persistence
 * 3. Apply theme variables to DOM
 * 4. Provide theme switching capability
 * 
 * IMPLEMENTATION NOTES:
 * - Uses localStorage for theme persistence
 * - Defaults to 'solarized-dark' theme if no saved preference
 * - Defaults to 'normal' compactness if no saved preference
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
  compactness: Compactness
  setCompactness: (compactness: Compactness) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'solarized-dark',
  setTheme: () => {},
  compactness: 'normal',
  setCompactness: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get saved theme from localStorage, default to solarized-dark
    const savedTheme = localStorage.getItem('theme') as Theme
    return savedTheme && Object.keys(themes).includes(savedTheme) ? savedTheme : 'solarized-dark'
  })

  const [compactness, setCompactness] = useState<Compactness>(() => {
    const savedCompactness = localStorage.getItem('compactness') as Compactness
    return savedCompactness && Object.keys(compactnessThemes).includes(savedCompactness) 
      ? savedCompactness 
      : 'normal'
  })

  useEffect(() => {
    // Save theme preferences to localStorage
    localStorage.setItem('theme', theme)
    localStorage.setItem('compactness', compactness)
    
    // Apply theme variables to document root
    const root = document.documentElement
    const themeVariables = themes[theme]
    const compactnessVariables = compactnessThemes[compactness]
    
    // Apply color theme variables
    Object.entries(themeVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Apply compactness theme variables
    Object.entries(compactnessVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [theme, compactness])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, compactness, setCompactness }}>
      {children}
    </ThemeContext.Provider>
  )
} 