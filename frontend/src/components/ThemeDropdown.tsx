import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../themes';

export const ThemeDropdown: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes: { id: Theme; label: string; icon: string }[] = [
    { id: 'light', label: 'Light Theme', icon: '☀️' },
    { id: 'dark', label: 'Dark Theme', icon: '🌑' },
    { id: 'solarized', label: 'Solarized Light Theme', icon: '🌞' },
    { id: 'solarized-dark', label: 'Solarized Dark Theme', icon: '🌚' },
  ];

  const currentTheme = themes.find(t => t.id === theme);

  return (
    <div className="theme-dropdown">
      <button
        className="theme-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Theme selector"
      >
        <span className="theme-icon" role="img" aria-label={currentTheme?.label}>
          {currentTheme?.icon}
        </span>
        <span className="dropdown-arrow" aria-hidden="true">▼</span>
      </button>
      {isOpen && (
        <div 
          className="theme-dropdown-menu"
          role="menu"
          aria-label="Theme options"
        >
          {themes.map(({ id, label, icon }) => (
            <button
              key={id}
              className={`theme-dropdown-item ${theme === id ? 'active' : ''}`}
              onClick={() => {
                setTheme(id);
                setIsOpen(false);
              }}
              role="menuitem"
              aria-label={label}
            >
              <span className="theme-icon" role="img" aria-hidden="true">
                {icon}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 