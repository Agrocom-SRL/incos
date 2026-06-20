/** Hook de acceso al tema (modo + toggle). SRP: solo lectura del contexto. */
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export function useTheme() {
  return useContext(ThemeContext);
}

export default useTheme;
