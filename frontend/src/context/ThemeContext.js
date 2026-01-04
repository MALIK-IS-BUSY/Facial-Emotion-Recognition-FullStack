import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      
      if (theme === 'dark') {
        document.documentElement.style.setProperty('--bg-primary', '#000000');
        document.documentElement.style.setProperty('--bg-secondary', '#111111');
        document.documentElement.style.setProperty('--bg-tertiary', '#1a1a1a');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#cccccc');
        document.documentElement.style.setProperty('--accent', '#ffffff');
        document.documentElement.style.setProperty('--border', '#333333');
      } else {
        document.documentElement.style.setProperty('--bg-primary', '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', '#f5f5f5');
        document.documentElement.style.setProperty('--bg-tertiary', '#e8e8e8');
        document.documentElement.style.setProperty('--text-primary', '#000000');
        document.documentElement.style.setProperty('--text-secondary', '#666666');
        document.documentElement.style.setProperty('--accent', '#000000');
        document.documentElement.style.setProperty('--border', '#e0e0e0');
      }
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

