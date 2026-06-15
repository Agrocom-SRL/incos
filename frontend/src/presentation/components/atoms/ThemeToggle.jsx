/**
 * ThemeToggle — átomo compartido para conmutar tema claro/oscuro.
 *
 * Promovido de matricula-v2/components/ThemeToggle.jsx a capa compartida.
 * Usa el ThemeProvider global (presentation/hooks/useTheme).
 * El icono conmuta con cross-fade suave; reduced-motion respetado.
 *
 * @module presentation/components/atoms/ThemeToggle
 * @level átomo
 */

import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '@presentation/hooks/useTheme';

// Alias capitalizado: el linter cuenta el uso JSX por identificador.
const MotionSpan = motion.span;

/** @type {import('react').ReactNode} */
const SunIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

/** @type {import('react').ReactNode} */
const MoonIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/**
 * Botón sol/luna. Recibe opcionalmente una clase CSS para adaptarse al contexto.
 * @param {{ className?: string }} props
 */
const ThemeToggle = ({ className = 'theme-toggle' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={className}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <MotionSpan
          key={isDark ? 'sun' : 'moon'}
          className={`${className}__icon`}
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 45 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          style={{ display: 'inline-flex' }}
        >
          {isDark ? SunIcon : MoonIcon}
        </MotionSpan>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
