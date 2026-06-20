/**
 * Presets de animación para Motion — derivados de los tokens de movimiento.
 *
 * Responsabilidad ÚNICA: traducir los tokens (--dur en ms → segundos para Motion)
 * a curvas/variantes reutilizables. "Motion motivado": cada variante tiene un uso.
 * Ningún componente define duraciones/curvas literales; consume estos presets.
 */
import { motion as motionTokens } from '@ds/tokens';

const s = (ms) => ms / 1000; // Motion usa segundos

export const EASE = motionTokens.ease;
export const DUR = {
  press: s(motionTokens.dur.press),
  hover: s(motionTokens.dur.hover),
  pop: s(motionTokens.dur.pop),
  drawer: s(motionTokens.dur.drawer),
};

/** Entrada suave hacia arriba — para superficies/secciones al montar. */
export const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.pop, ease: EASE.out } },
};

/** Contenedor con stagger — listas/grids que aparecen en cascada. */
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

/** Ítem de un contenedor con stagger. */
export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.pop, ease: EASE.out } },
};

export default { EASE, DUR, fadeInUp, staggerContainer, staggerItem };
