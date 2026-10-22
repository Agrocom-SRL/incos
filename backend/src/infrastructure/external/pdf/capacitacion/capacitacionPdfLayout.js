/**
 * Aritmética pura de geometría de los PDF de Capacitación.
 *
 * Funciones sin dependencias de pdf-lib: reparten el ancho útil entre las líneas de
 * firma, deciden si un bloque cabe en lo que queda de página y formatean montos.
 * Testeable de forma aislada.
 */

/**
 * Reparte el ancho útil en `count` columnas iguales y devuelve, por columna, los
 * extremos de la línea de firma (centrada, con ancho máximo `lineWidth`) y su centro.
 *
 * @param {Object} params
 * @param {number} params.count - Número de firmas.
 * @param {number} params.startX - X del borde izquierdo del área útil.
 * @param {number} params.contentWidth - Ancho del área útil.
 * @param {number} [params.lineWidth=150] - Ancho máximo de cada línea de firma.
 * @param {number} [params.gap=30] - Separación mínima entre líneas contiguas.
 * @returns {Array<{ x1:number, x2:number, centerX:number }>}
 */
export function computeFirmaColumnas({ count, startX, contentWidth, lineWidth = 150, gap = 30 }) {
  if (!count || count < 1) return [];
  const colWidth = contentWidth / count;
  const width = Math.max(0, Math.min(lineWidth, colWidth - gap));
  return Array.from({ length: count }, (_, i) => {
    const centerX = startX + colWidth * i + colWidth / 2;
    return { x1: centerX - width / 2, x2: centerX + width / 2, centerX };
  });
}

/**
 * ¿Cabe un bloque de `requerido` puntos entre el cursor actual y el piso útil?
 *
 * @param {Object} params
 * @param {number} params.currentY - Y actual del cursor (desde abajo).
 * @param {number} params.requerido - Alto que necesita el bloque.
 * @param {number} params.floorY - Y mínimo permitido (margen inferior + pie de plantilla).
 * @returns {boolean}
 */
export function cabeBloque({ currentY, requerido, floorY }) {
  return currentY - requerido >= floorY;
}

/**
 * Formatea un monto en bolivianos con dos decimales ("150.00 Bs").
 *
 * @param {number|string|null|undefined} monto
 * @param {string} [moneda='Bs']
 * @returns {string}
 */
export function formatearMonto(monto, moneda = 'Bs') {
  const numero = Number(monto);
  return `${(Number.isFinite(numero) ? numero : 0).toFixed(2)} ${moneda}`;
}

/**
 * Devuelve el valor como texto, o el marcador si viene vacío.
 *
 * @param {*} valor
 * @param {string} placeholder
 * @returns {string}
 */
export function valorODefecto(valor, placeholder) {
  const texto = valor == null ? '' : String(valor).trim();
  return texto || placeholder;
}
