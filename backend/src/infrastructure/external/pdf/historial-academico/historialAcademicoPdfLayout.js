/**
 * Aritmética pura de geometría del Historial Académico FORM-SIE-ITT-04 (PDF).
 *
 * Funciones sin dependencias de pdf-lib, testeables de forma aislada. La
 * geometría de columnas (proporciones → x/width absolutos) es idéntica a la del
 * boletín, así que se REEXPORTA desde `boletinPdfLayout.js` en vez de duplicarla
 * (regla del proyecto: no copiar lógica igual). Aquí solo viven los helpers
 * propios del historial: orden canónico de filas y decisión de salto de página.
 */

import { computeColumnGeometry as computeBaseColumnGeometry } from '../boletin/boletinPdfLayout.js';

export { computeTableHeight } from '../boletin/boletinPdfLayout.js';

/**
 * Geometría de columnas del historial: delega la aritmética en la función del
 * boletín y le suma el flag `wrap` (envolver texto, p. ej. ASIGNATURA), que la
 * base no propaga.
 *
 * @param {Object} params - Mismos parámetros que `computeColumnGeometry` del boletín.
 * @returns {Array<Object>} Columnas con x/width absolutos + `wrap`.
 */
export function computeColumnGeometry(params) {
  const geoms = computeBaseColumnGeometry(params);
  return geoms.map((geom, i) => ({ ...geom, wrap: Boolean(params.columns[i]?.wrap) }));
}

/**
 * Ordena las filas del transcript en el orden canónico de la pantalla:
 * gestión (año) → periodo (número) → nro. No muta el arreglo original.
 *
 * @param {Array<{ gestionAnio:(number|string), periodoNumero:number, nro:number }>} filas
 * @returns {Array<Object>} Copia ordenada de las filas.
 */
export function ordenarFilasHistorial(filas) {
  const list = Array.isArray(filas) ? [...filas] : [];
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  return list.sort(
    (a, b) =>
      num(a?.gestionAnio) - num(b?.gestionAnio) ||
      num(a?.periodoNumero) - num(b?.periodoNumero) ||
      num(a?.nro) - num(b?.nro)
  );
}

/**
 * Decide si un bloque de altura `blockHeight` que arranca en `currentY` cabe en
 * la página sin invadir el piso reservado (`floorY`, sobre el pie verde de la
 * plantilla).
 *
 * @param {Object} params
 * @param {number} params.currentY - Y del borde superior del bloque a dibujar.
 * @param {number} params.blockHeight - Altura del bloque (fila, cabecera, pie).
 * @param {number} params.floorY - Y mínima permitida para el borde inferior.
 * @returns {boolean} true si NO cabe y hay que saltar de página.
 */
export function necesitaSaltoPagina({ currentY, blockHeight, floorY }) {
  return currentY - blockHeight < floorY;
}
