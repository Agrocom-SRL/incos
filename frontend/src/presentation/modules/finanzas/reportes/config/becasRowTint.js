/**
 * Tinte de fila por carrera para la planilla de becas (Bloque por carrera).
 *
 * Convierte el color institucional YA sanitizado de la carrera
 * (`resolveCarreraDashboardColor`) en un `rgba` atenuado para teñir el fondo de
 * sus filas y leer el bloque de cada carrera. Las opacidades por nivel viven
 * aquí (única fuente): la fila de carrera se tiñe algo más; sus hijas (periodo /
 * paralelo) más leve, del mismo color. El borde (acento lateral) usa más alfa.
 *
 * El color es de NEGOCIO (viene de datos); este helper solo lo atenúa para UI.
 */

/** Opacidad del tinte de fondo por nivel del árbol (carrera más visible). */
const ALPHA_FONDO = {
  carrera: 0.16,
  periodo: 0.09,
  paralelo: 0.05,
};

/** Opacidad del acento lateral (borde) de la fila de carrera. */
const ALPHA_BORDE = 0.55;

const hexToRgb = (hex) => {
  const s = String(hex || '').trim();
  const body = s.startsWith('#') ? s.slice(1) : s;
  if (!/^[0-9A-Fa-f]{6}$/.test(body)) return null;
  return {
    r: parseInt(body.slice(0, 2), 16),
    g: parseInt(body.slice(2, 4), 16),
    b: parseInt(body.slice(4, 6), 16),
  };
};

/** rgba atenuado a partir de un hex sanitizado; null si el hex no es válido. */
export const buildCarreraTint = (hex, alpha) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

/** Alfa de fondo del nivel (con respaldo al de paralelo si el nivel es atípico). */
export const tintAlphaByNivel = (nivel) => ALPHA_FONDO[nivel] ?? ALPHA_FONDO.paralelo;

export { ALPHA_BORDE };

export default buildCarreraTint;
