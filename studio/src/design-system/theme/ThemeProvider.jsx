/**
 * ThemeProvider — estado del modo (light/dark) + theming de AntD.
 *
 * Responsabilidad ÚNICA: gobernar el modo de color. Persiste la preferencia,
 * sincroniza las CSS vars (applyThemeVars) y alimenta el ConfigProvider de AntD
 * (buildAntdTheme). Los consumidores leen el modo con useTheme().
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
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

  // applyThemeVars escribe las CSS vars del DS en :root. Corre en useLayoutEffect
  // (síncrono, ANTES del paint) para alinear el timing con los tokens de AntD.
  // Además marca <html data-theme-switching> mientras aplica el nuevo tema para
  // ANULAR las transiciones (base.css): así inputs, header de tabla, columna fija
  // y sidebar saltan al nuevo color en el mismo frame en vez de animar ~200ms su
  // background (el efecto que se veía como "se quedan con el color anterior").
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme-switching', '');
    applyThemeVars(mode);
    // Fuerza reflow para que los nuevos valores se calculen con transición=none…
    void root.offsetHeight;
    // …y reactiva las transiciones en el siguiente frame (ya con el color final,
    // así no se dispara ninguna animación residual).
    const id = requestAnimationFrame(() => {
      root.removeAttribute('data-theme-switching');
    });
    return () => cancelAnimationFrame(id);
  }, [mode]);

  // La persistencia no necesita bloquear el paint: va en un efecto normal.
  useEffect(() => {
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
