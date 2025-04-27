import React from 'react';
import { ThemeDropdown } from './ThemeDropdown';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Stacks</h1>
        <ThemeDropdown />
      </div>
    </header>
  );
}; 