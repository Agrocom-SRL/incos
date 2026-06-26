/**
 * Aritmética pura de geometría del Boletín de Calificaciones (PDF).
 *
 * Funciones sin dependencias de pdf-lib: calculan posiciones/anchos de columnas y
 * la altura total de la tabla a partir de la página y la configuración. Testeable
 * de forma aislada.
 */

/**
 * Convierte las proporciones de columna en geometría absoluta (x, width) a partir
 * del ancho de contenido y la X inicial.
 *
 * @param {Object} params
 * @param {Array<{ key:string, label:string, width:number, align:string,
 *                 tinted?:boolean }>} params.columns - Columnas con `width` proporcional.
 * @param {number} params.contentWidth - Ancho disponible (página menos márgenes).
 * @param {number} params.startX - X del borde izquierdo de la tabla.
 * @returns {Array<{ key:string, label:string, align:string, tinted:boolean,
 *                   x:number, width:number }>} Columnas con X/ancho absolutos.
 */
export function computeColumnGeometry({ columns, contentWidth, startX }) {
  const totalProportion = columns.reduce((sum, col) => sum + (col.width || 0), 0) || 1;
  let cursor = startX;
  return columns.map((col) => {
    const width = (col.width / totalProportion) * contentWidth;
    const geom = {
      key: col.key,
      label: col.label,
      align: col.align || 'left',
      tinted: Boolean(col.tinted),
      x: cursor,
      width
    };
    cursor += width;
    return geom;
  });
}

/**
 * Altura total de la tabla (cabecera + filas de datos + fila de pie opcional).
 *
 * @param {Object} params
 * @param {number} params.headerHeight
 * @param {number} params.rowHeight
 * @param {number} params.dataRowCount
 * @param {boolean} [params.includeFooterRow=false]
 * @returns {number} Altura en puntos.
 */
export function computeTableHeight({
  headerHeight,
  rowHeight,
  dataRowCount,
  includeFooterRow = false
}) {
  const rows = dataRowCount + (includeFooterRow ? 1 : 0);
  return headerHeight + rows * rowHeight;
}

/**
 * Calcula las coordenadas Y de las líneas horizontales de la tabla (de arriba a
 * abajo): tope, base de cabecera, cada límite de fila de datos y base del pie.
 *
 * @param {Object} params
 * @param {number} params.topY - Y del borde superior de la tabla.
 * @param {number} params.headerHeight
 * @param {number} params.rowHeight
 * @param {number} params.dataRowCount
 * @param {boolean} [params.includeFooterRow=false]
 * @returns {number[]} Lista de Y (descendente) de las líneas horizontales.
 */
export function computeHorizontalLineYs({
  topY,
  headerHeight,
  rowHeight,
  dataRowCount,
  includeFooterRow = false
}) {
  const ys = [topY, topY - headerHeight];
  const totalRows = dataRowCount + (includeFooterRow ? 1 : 0);
  let y = topY - headerHeight;
  for (let i = 0; i < totalRows; i += 1) {
    y -= rowHeight;
    ys.push(y);
  }
  return ys;
}
