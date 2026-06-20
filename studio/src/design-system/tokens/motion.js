/**
 * Tokens de movimiento — única fuente de curvas y duraciones.
 * Consumido por el theme (CSS vars de ease y duración) y por presets de Motion.
 * Ninguna transición debe usar curvas/duraciones literales.
 */
export const motion = {
  ease: {
    out: 'cubic-bezier(0.23, 1, 0.32, 1)',
    inOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
    drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  dur: {
    press: 140,
    hover: 160,
    pop: 200,
    swapOut: 160,
    swapIn: 260,
    drawer: 320,
    bell: 350,
  },
};

export default motion;
