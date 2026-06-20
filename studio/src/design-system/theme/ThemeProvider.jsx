/**
 * ThemeProvider — estado del modo (light/dark) + theming de AntD.
 *
 * Responsabilidad ÚNICA: gobernar el modo de color. Persiste la preferencia,
 * sincroniza las CSS vars (applyThemeVars) y alimenta el ConfigProvider de AntD
 * (buildAntdTheme). Los consumidores leen el modo con useTheme().
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfigProvider } from 'antd';
import { activeBrand } from '@config/brand';
import { ThemeContext } from './ThemeContext';
import { applyThemeVars } from './applyThemeVars';
import { buildAntdTheme } from './buildAntdTheme';

const STORAGE_KEY = 'studio-theme-mode';

function readInitialMode() {
  if (!activeBrand.features.darkMode) return 'light';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* storage no disponible */
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readInitialMode);

  useEffect(() => {
    applyThemeVars(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const toggle = useCallback(() => {
    if (!activeBrand.features.darkMode) return;
    setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ mode, setMode, toggle }), [mode, toggle]);
  const antdTheme = useMemo(() => buildAntdTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
