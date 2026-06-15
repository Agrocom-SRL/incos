/**
 * Hook y Provider global de tema claro/oscuro para INCOS.
 *
 * Promovido de matricula-v2/hooks/useTheme.jsx a la capa compartida.
 * Controla:
 *   - El atributo `data-theme` en <html> (brand-tokens.css reacciona a
 *     :root[data-theme='light|dark']).
 *   - La clave `incos-theme` en localStorage para persistir la preferencia.
 *   - Llama `applyThemeVars(mode)` al cambiar modo → actualiza --brand-N
 *     en runtime (single source: brandScale de tokens/colors.js).
 *
 * Preparado para accent/scale runtime: la firma de applyThemeVars acepta
 * overrides pero la feature NO está implementada todavía.
 *
 * @module presentation/hooks/useTheme
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { applyThemeVars } from '@theme/root';

const STORAGE_KEY = 'incos-theme';

const ThemeContext = createContext(null);

/** Lee la preferencia guardada o devuelve 'light' como seguro. */
function readInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem(STORAGE_KEY) || 'light';
}

/**
 * Provider que gestiona el tema global de la aplicación.
 * Debe envolver la raíz de la app (App.jsx).
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    // Re-inyecta --brand-N conmutables (idempotente; no afecta --color-* legacy)
    applyThemeVars(theme);
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

/**
 * Consume el contexto de tema global.
 * Lanza error si se llama fuera de ThemeProvider.
 *
 * @returns {{ theme: 'light'|'dark', setTheme: Function, toggleTheme: Function }}
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider (presentation/hooks/useTheme)');
  }
  return ctx;
}
