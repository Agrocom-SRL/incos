/**
 * Contexto de tema (solo la definición del contexto — SRP).
 * Separado del provider para no mezclar componente y dato (react-refresh limpio).
 */
import { createContext } from 'react';

/** @type {import('react').Context<{ mode: 'light'|'dark', toggle: () => void, setMode: (m: 'light'|'dark') => void }>} */
export const ThemeContext = createContext({
  mode: 'light',
  toggle: () => {},
  setMode: () => {},
});

export default ThemeContext;
