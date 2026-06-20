/**
 * Re-export del useReducedMotion de Motion como punto único del design-system.
 * Los componentes importan desde @lib/motion, no desde la librería directamente
 * (DIP: dependemos de nuestra abstracción, no del paquete).
 */
export { useReducedMotion } from 'motion/react';
