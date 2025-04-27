import React from 'react'
import { useTheme } from './context/ThemeContext'
import './App.css'
import { Samples } from './components/ui/samples'

function App() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="app">
      <h1>React Version Check</h1>
      <p>Current React version: {React.version}</p>

      <Samples />
      
      <div className="theme-switcher">
        <button
          className={`theme-button ${theme === 'light' ? 'active' : ''}`}
          onClick={() => setTheme('light')}
        >
          Light
        </button>
        <button
          className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => setTheme('dark')}
        >
          Dark
        </button>
        <button
          className={`theme-button ${theme === 'solarized' ? 'active' : ''}`}
          onClick={() => setTheme('solarized')}
          title="Solarized Light"
        >
          <span className="theme-icon">☀️</span>
        </button>
        <button
          className={`theme-button ${theme === 'solarized-dark' ? 'active' : ''}`}
          onClick={() => setTheme('solarized-dark')}
          title="Solarized Dark"
        >
          <span className="theme-icon">🌙</span>
        </button>
      </div>
    </div>
  )
}

export default App
