/**
 * Fuente única de accesibilidad de motion para el módulo (§6b incos-ui-system).
 * Reexporta el hook de Motion para que ningún componente compruebe
 * `prefers-reduced-motion` de forma ad-hoc. Si en el futuro la capa de motion se
 * sube a `presentation/motion/`, este archivo se redirige allí.
 */
export { useReducedMotion } from 'motion/react';
