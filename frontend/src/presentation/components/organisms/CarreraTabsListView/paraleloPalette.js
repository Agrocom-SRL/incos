/**
 * Paleta categórica para el filtro de curso/paralelo.
 *
 * Colores medianamente oscuros (legibles con texto blanco en el estado activo) y distintos
 * entre sí y del verde de marca. El color se asigna por NOMBRE BASE del paralelo
 * (p. ej. "PRIMERO A", sin turno) con un orden canónico global, de modo que el mismo
 * paralelo tenga el mismo color en todas las carreras (los paralelos son análogos entre
 * carreras según `25-seed-paralelos.sql`).
 */

// Gama de 8 familias de color DISTINTAS (una por familia: azul, teal, naranja, rosa,
// violeta, verde-oliva, rojo, pizarra) — sin dos naranjas ni dos magentas. Todas son lo
// bastante oscuras para llevar texto blanco (contraste AA) en el chip activo.
export const PARALELO_PALETTE = [
  '#2563eb', // azul         → PRIMERO A
  '#0d9488', // teal         → PRIMERO B
  '#c2410c', // naranja      → PRIMERO C
  '#db2777', // rosa         → PRIMERO D
  '#7c3aed', // violeta      → SEGUNDO A
  '#4d7c0f', // verde oliva  → SEGUNDO B
  '#dc2626', // rojo         → TERCERO A
  '#475569', // pizarra      → TERCERO B
];

/** Color para la opción "Todos" (agregado de la carrera): verde de marca. */
export const PARALELO_ALL_COLOR = '#196b45';

/** Color neutro para la opción "Sin paralelo". */
export const PARALELO_SIN_COLOR = '#6b7280';

/**
 * Construye un mapa colorKey → color estable y global (mismo orden en todas las carreras).
 * @param {string[]} colorKeys - claves de color (nombres base de paralelo) presentes en el dataset.
 * @returns {Record<string,string>}
 */
export function buildParaleloColorMap(colorKeys = []) {
  const distinct = [...new Set(colorKeys.filter(Boolean).map(String))].sort((a, b) =>
    a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }),
  );
  const map = {};
  distinct.forEach((key, index) => {
    map[key] = PARALELO_PALETTE[index % PARALELO_PALETTE.length];
  });
  return map;
}
