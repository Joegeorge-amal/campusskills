import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const THEME_KEY = 'campusskills_theme';

const getSystemTheme = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
};

const getSavedTheme = () => localStorage.getItem(THEME_KEY);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getSavedTheme() || getSystemTheme());
  const [followingSystem, setFollowingSystem] = useState(!getSavedTheme());

  const applyTheme = useCallback((t) => {
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (!followingSystem) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const next = e.matches ? 'dark' : 'light';
      setTheme(next);
      applyTheme(next);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [followingSystem, applyTheme]);

  const toggleTheme = useCallback(() => {
    setFollowingSystem(false);
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
