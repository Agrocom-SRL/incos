/**
 * Toggle sol/luna para tema claro/oscuro.
 * El cambio de tema es ocasional → candidato legítimo a microtransición de
 * estado (cross-fade + rotación corta entre los iconos). Respeta reduced-motion.
 */
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Alias capitalizado: el linter cuenta el uso JSX por identificador, no por `motion.span`.
const MotionSpan = motion.span;

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

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const reduce = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="matricula-v2-theme-toggle"
      aria-label="Cambiar tema"
    >
      <AnimatePresence mode="wait" initial={false}>
        <MotionSpan
          key={isDark ? 'sun' : 'moon'}
          className="matricula-v2-theme-toggle__icon"
          initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -45 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, rotate: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 45 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        >
          {isDark ? SunIcon : MoonIcon}
        </MotionSpan>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
