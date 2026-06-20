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
  swapIn: s(motionTokens.dur.swapIn),
  swapOut: s(motionTokens.dur.swapOut),
  drawer: s(motionTokens.dur.drawer),
};

/** Entrada suave hacia arriba — para superficies/secciones al montar. */
export const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.pop, ease: EASE.out } },
};

/**
 * Revelado de la fila collapse (ResidualRow) ENCADENADO al crecimiento del <tr>.
 *
 * Al expandir una fila, AntD cambia la ALTURA del <tr> de golpe; un fade con
 * desplazamiento vertical competiría con ese salto y se sentiría como doble
 * gesto. Por eso aquí: (1) NO traslada en Y (no pelea con el cambio de altura),
 * solo opacidad; (2) DIFIERE el fade con `delay` igual al tiempo de expansión de
 * la fila (`DUR.swapIn`, mismo timing del sistema), de modo que el contenido
 * aparezca cuando la fila YA terminó de crecer → un solo gesto continuo.
 */
export const residualReveal = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DUR.pop, ease: EASE.out, delay: DUR.swapIn },
  },
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

/**
 * Intercambio de cuerpos completos (skeleton ↔ vacío ↔ tabla/grid) bajo
 * AnimatePresence mode="popLayout". Entrada con lift+scale; salida con fade rápido
 * (asimétrico) para que lo nuevo "empuje" sin corte brusco.
 */
export const presenceSwap = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.swapIn, ease: EASE.out } },
  exit: { opacity: 0, transition: { duration: DUR.swapOut, ease: EASE.out } },
};

/**
 * Swap puntual de un elemento (toolbar bulk ↔ contador) bajo AnimatePresence
 * mode="wait": micro-desplazamiento vertical, sin escala.
 */
export const presenceWait = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.hover, ease: EASE.out } },
  exit: { opacity: 0, y: -4, transition: { duration: DUR.press, ease: EASE.out } },
};

export default {
  EASE,
  DUR,
  fadeInUp,
  residualReveal,
  staggerContainer,
  staggerItem,
  presenceSwap,
  presenceWait,
};
