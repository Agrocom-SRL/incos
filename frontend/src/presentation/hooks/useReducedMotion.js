/**
 * useReducedMotion — hook compartido (capa global).
 *
 * Reexporta el hook de Motion para que ningún componente compruebe
 * prefers-reduced-motion de forma ad-hoc. Fuente única de accesibilidad
 * de motion para toda la app (§6b incos-ui-system).
 *
 * @module presentation/hooks/useReducedMotion
 */
export { useReducedMotion } from 'motion/react';
