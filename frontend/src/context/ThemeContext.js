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
      
      // Pure black and white theme
      if (theme === 'dark') {
        document.documentElement.style.setProperty('--bg-primary', '#000000');
        document.documentElement.style.setProperty('--bg-secondary', '#0a0a0a');
        document.documentElement.style.setProperty('--bg-tertiary', '#141414');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
        document.documentElement.style.setProperty('--accent', '#ffffff');
        document.documentElement.style.setProperty('--border', '#2a2a2a');
        document.documentElement.style.setProperty('--shadow', 'rgba(255, 255, 255, 0.1)');
      } else {
        document.documentElement.style.setProperty('--bg-primary', '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', '#fafafa');
        document.documentElement.style.setProperty('--bg-tertiary', '#f0f0f0');
        document.documentElement.style.setProperty('--text-primary', '#000000');
        document.documentElement.style.setProperty('--text-secondary', '#4a4a4a');
        document.documentElement.style.setProperty('--accent', '#000000');
        document.documentElement.style.setProperty('--border', '#d0d0d0');
        document.documentElement.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
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

