import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../themes';
import { Compactness } from '../themes/compactness';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import './ThemeDropdown.css';

export const ThemeDropdown: React.FC = () => {
  const { theme, setTheme, compactness, setCompactness } = useTheme();

  const themes: { id: Theme; label: string; icon: string }[] = [
    { id: 'light', label: 'Light Theme', icon: '🌞' },
    { id: 'solarized', label: 'Solarized Light Theme', icon: '🌕' },
    { id: 'solarized-dark', label: 'Solarized Dark Theme', icon: '🌒' },
    { id: 'dark', label: 'Dark Theme', icon: '🌚' },
  ];

  const compactnessOptions: { id: Compactness; label: string; icon: string }[] = [
    { id: 'spacious', label: 'Spacious Layout', icon: '🐳' },
    { id: 'normal', label: 'Normal Layout', icon: '🐬' },
    { id: 'compact', label: 'Compact Layout', icon: '🐟' },
  ];

  const currentTheme = themes.find(t => t.id === theme);
  const currentCompactness = compactnessOptions.find(c => c.id === compactness);

  return (
    <div className="theme-dropdown">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="theme-dropdown-trigger" aria-label="Theme selector">
          <span className="theme-icon" role="img" aria-label={currentTheme?.label}>
            {currentTheme?.icon}
          </span>
          <span className="dropdown-arrow" aria-hidden="true">▼</span>
        </DropdownMenu.Trigger>
        
        <DropdownMenu.Portal>
          <DropdownMenu.Content 
            className="theme-dropdown-menu" 
            sideOffset={5}
            align="end"
            collisionPadding={8}
          >
            {themes.map(({ id, label, icon }) => (
              <DropdownMenu.Item
                key={id}
                className={`theme-dropdown-item ${theme === id ? 'active' : ''}`}
                onClick={() => setTheme(id)}
                aria-label={label}
              >
                <span className="theme-icon" role="img" aria-hidden="true">
                  {icon}
                </span>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="theme-dropdown-trigger" aria-label="Layout compactness selector">
          <span className="theme-icon" role="img" aria-label={currentCompactness?.label}>
            {currentCompactness?.icon}
          </span>
          <span className="dropdown-arrow" aria-hidden="true">▼</span>
        </DropdownMenu.Trigger>
        
        <DropdownMenu.Portal>
          <DropdownMenu.Content 
            className="theme-dropdown-menu" 
            sideOffset={5}
            align="end"
            collisionPadding={8}
          >
            {compactnessOptions.map(({ id, label, icon }) => (
              <DropdownMenu.Item
                key={id}
                className={`theme-dropdown-item ${compactness === id ? 'active' : ''}`}
                onClick={() => setCompactness(id)}
                aria-label={label}
                data-compactness={id}
              >
                <span className="theme-icon" role="img" aria-hidden="true">
                  {icon}
                </span>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}; 