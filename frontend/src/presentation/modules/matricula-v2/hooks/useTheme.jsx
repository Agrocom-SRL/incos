/**
 * Tema claro/oscuro para Matrícula v2 (persistido en localStorage).
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'incos-theme';

const ThemeContext = createContext(null);

function readInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem(STORAGE_KEY) || 'light';
}

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function MatriculaV2ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de MatriculaV2ThemeProvider');
  }
  return ctx;
}
