export type Theme = 'light' | 'dark' | 'solarized' | 'solarized-dark'

export const themes = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f5f5f5',
    '--text-primary': '#333333',
    '--text-secondary': '#666666',
    '--accent': '#007bff',
    '--border': '#e0e0e0',
    '--radius': '0.5rem',
    '--ring': '0 0 0 1px var(--accent)',
  },
  dark: {
    '--bg-primary': '#121212',
    '--bg-secondary': '#1e1e1e',
    '--text-primary': '#ffffff',
    '--text-secondary': '#a0a0a0',
    '--accent': '#0d6efd',
    '--border': '#333333',
    '--radius': '0.5rem',
    '--ring': '0 0 0 1px var(--accent)',
  },
  solarized: {
    '--bg-primary': '#fdf6e3',
    '--bg-secondary': '#eee8d5',
    '--text-primary': '#586e75',
    '--text-secondary': '#93a1a1',
    '--accent': '#268bd2',
    '--border': '#93a1a1',
    '--radius': '0.5rem',
    '--ring': '0 0 0 1px var(--accent)',
  },
  'solarized-dark': {
    '--bg-primary': '#002b36',
    '--bg-secondary': '#073642',
    '--text-primary': '#839496',
    '--text-secondary': '#586e75',
    '--accent': '#268bd2',
    '--border': '#586e75',
    '--radius': '0.5rem',
    '--ring': '0 0 0 1px var(--accent)',
  },
} 