/**
 * Normalización de las filas de paralelos del dashboard de horarios
 * (vista_horarios_paralelo_estado, snake_case) al shape camelCase que consumen
 * las pantallas del Centralizador (tarjetas P1, cabecera de documento P2/P3).
 */

/**
 * @param {Object} row fila snake_case del dashboard de paralelos
 * @returns {{ paraleloGestionId:number|null, paraleloNombre, carreraNombre,
 *   carreraColorHex, periodoNombre, turno, asignaturasRequeridas, cursosCreados }}
 */
export const normalizarParaleloCentralizador = (row) => ({
  paraleloGestionId:
    row.paralelo_gestion_id != null ? Number(row.paralelo_gestion_id) : null,
  paraleloNombre: row.paralelo_nombre ?? null,
  carreraNombre: row.carrera_nombre ?? null,
  carreraColorHex: row.carrera_color_hex ?? null,
  periodoNombre: row.periodo_nombre ?? null,
  turno: row.turno ?? null,
  asignaturasRequeridas:
    row.asignaturas_requeridas != null ? Number(row.asignaturas_requeridas) : null,
  cursosCreados: row.cursos_creados != null ? Number(row.cursos_creados) : null,
});

/** Normaliza y filtra la colección, descartando filas sin paralelo_gestion_id. */
export const normalizarParalelosCentralizador = (rows = []) =>
  (Array.isArray(rows) ? rows : [])
    .map(normalizarParaleloCentralizador)
    .filter((p) => p.paraleloGestionId != null);
