/**
 * presentation/motion/index.js — barrel de la capa de motion compartida.
 *
 * Re-exporta todo lo necesario para animar en INCOS:
 *   - presets (EASE / DUR / STAGGER / variants)
 *   - wrappers atómicos (FadeIn, Stagger, CountUp, PresenceSwap, Collapse)
 *   - hooks (useReducedMotion, useCountUp)
 *
 * Ningún componente importa literales de duración/easing directamente.
 * CSS consume var(--ease-*) / var(--dur-*) de brand-tokens.css.
 * JS consume EASE / DUR de este barrel.
 *
 * @module presentation/motion
 */

// Presets (tokens JS)
export { EASE, DUR, STAGGER, variants } from './presets';

// Hooks
export { useReducedMotion } from '../hooks/useReducedMotion';
export { useCountUp } from '../hooks/useCountUp';

// Wrappers atómicos
export { default as FadeIn } from '../components/atoms/motion/FadeIn';
export { default as Stagger } from '../components/atoms/motion/Stagger';
export { default as CountUp } from '../components/atoms/motion/CountUp';
export { default as PresenceSwap } from '../components/atoms/motion/PresenceSwap';
export { default as Collapse } from '../components/atoms/motion/Collapse';
