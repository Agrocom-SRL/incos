/**
 * groupByCarrera - Agrupa filas de un listado por carrera para pintarlas en tabs.
 *
 * Single Responsibility: partir un dataset plano en grupos por carrera (más un grupo
 * "Sin carrera" para filas sin carrera asignada), preservando color/código de cada carrera.
 *
 * Genérico: recibe un accessor `getCarrera(row)` que devuelve
 * `{ id?, nombre?, codigo?, colorHex? }` para desacoplarlo del shape de cada módulo
 * (estudiantes: campos planos; inscripciones: objeto anidado `carrera`).
 *
 * @param {Array} rows
 * @param {(row: any) => ({ id?: any, nombre?: string, codigo?: string, colorHex?: string })} getCarrera
 * @returns {Array<{ key: string, id: any, nombre: string, codigo: string|null,
 *   colorHex: string|null, esSinCarrera: boolean, rows: Array }>} grupos ordenados
 *   alfabéticamente por nombre, con "Sin carrera" siempre al final (si existe).
 */
export const SIN_CARRERA_KEY = '__sin_carrera__';

export function groupByCarrera(rows = [], getCarrera) {
  const groups = new Map();
  const sinCarrera = [];

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const carrera = (typeof getCarrera === 'function' ? getCarrera(row) : null) || {};
    const nombre = carrera.nombre || null;
    const codigo = carrera.codigo || null;
    const id = carrera.id ?? null;
    // Clave estable: id > código > nombre. Sin ninguno → grupo "Sin carrera".
    const rawKey = id != null ? `id:${id}` : codigo || nombre;

    if (!rawKey) {
      sinCarrera.push(row);
      return;
    }

    const key = String(rawKey);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        id,
        nombre: nombre || codigo || 'Carrera',
        codigo,
        colorHex: carrera.colorHex || null,
        esSinCarrera: false,
        rows: [],
      });
    }
    groups.get(key).rows.push(row);
  });

  const ordered = [...groups.values()].sort((a, b) =>
    String(a.nombre).localeCompare(String(b.nombre), 'es', { sensitivity: 'base' }),
  );

  if (sinCarrera.length) {
    ordered.push({
      key: SIN_CARRERA_KEY,
      id: null,
      nombre: 'Sin carrera',
      codigo: null,
      colorHex: null,
      esSinCarrera: true,
      rows: sinCarrera,
    });
  }

  return ordered;
}
