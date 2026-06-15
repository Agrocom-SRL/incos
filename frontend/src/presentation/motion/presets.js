/**
 * presets.js — única fuente JS de tokens de motion (espeja brand-tokens.css).
 *
 * REGLA: ningún componente usa literales de duración/easing (ej. [0.23,1,0.32,1]).
 * Importar desde aquí. Estos valores derivan de los mismos números que
 * --ease-out/--dur-* en brand-tokens.css para mantener coherencia CSS↔JS.
 *
 * @module presentation/motion/presets
 */

/**
 * Curvas de easing — espejan --ease-* de brand-tokens.css.
 * Usar array para motion/react (ej. ease: EASE.out).
 */
export const EASE = {
  /** --ease-out: cubic-bezier(0.23, 1, 0.32, 1) — entrada rápida, salida suave */
  out: [0.23, 1, 0.32, 1],
  /** --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1) — movimientos en pantalla */
  inOut: [0.77, 0, 0.175, 1],
  /** --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1) — iOS-like, para drawers */
  drawer: [0.32, 0.72, 0, 1],
};

/**
 * Duraciones en segundos — espejan --dur-* de brand-tokens.css.
 * motion/react usa segundos, CSS usa ms (ej. DUR.press = 0.14s = 140ms).
 */
export const DUR = {
  /** --dur-press: 140ms — feedback inmediato de pulsación */
  press: 0.14,
  /** --dur-hover: 160ms — hover suave */
  hover: 0.16,
  /** --dur-pop: 200ms — entradas/acordeón */
  pop: 0.20,
  /** Duración base de entrada de vistas/listas */
  base: 0.26,
  /** Duración de salida asimétrica (más rápida que entrada) */
  exit: 0.16,
  /** Count-up de KPIs — más lento para efecto dramático */
  count: 0.55,
  /** --dur-drawer: 320ms — drawers/panels */
  drawer: 0.32,
  /** --dur-bell: 350ms — keyframe bell-tilt de notificaciones */
  bell: 0.35,
};

/**
 * Stagger — parámetros de entrada escalonada para listas/grillas.
 */
export const STAGGER = {
  /** Delay entre hijos (staggerChildren) */
  children: 0.05,
  /** Delay inicial antes del primer hijo (delayChildren) */
  delay: 0.03,
  /** Delay por índice para animaciones manuales (secciones del Drawer) */
  perIndex: 0.05,
};

/**
 * Variants reutilizables — bloques predefinidos para los wrappers.
 * Importar en FadeIn, Stagger, PresenceSwap, etc.
 */
export const variants = {
  /**
   * fadeUp — entrada fade + translateY desde abajo.
   * Para FadeIn y Stagger.Item.
   */
  fadeUp: {
    hidden: (reduce) => ({ opacity: 0, y: reduce ? 0 : 8 }),
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: DUR.base, ease: EASE.out },
    },
  },

  /**
   * Contenedor de stagger — no anima él mismo, propaga a hijos.
   */
  staggerContainer: (reduce) => ({
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : STAGGER.children,
        delayChildren: reduce ? 0 : STAGGER.delay,
      },
    },
  }),

  /**
   * presenceSwap — cross-view asimétrico (tabla↔tarjetas, toolbar bulk).
   * Enter: más lento con y+scale. Exit: rápido sin escala.
   */
  presenceSwap: {
    hidden: { opacity: 0, y: 8, scale: 0.985 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: DUR.base, ease: EASE.out },
    },
    exit: {
      opacity: 0,
      y: -6,
      transition: { duration: DUR.exit, ease: EASE.out },
    },
  },

  /**
   * presenceWait — swap simple sin escala (toolbar bulk actions).
   */
  presenceWait: {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DUR.hover, ease: EASE.out },
    },
    exit: {
      opacity: 0,
      y: 6,
      transition: { duration: DUR.hover, ease: EASE.out },
    },
  },
};
