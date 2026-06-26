/**
 * Normalización de las filas de paralelos del dashboard de horarios
 * (vista_horarios_paralelo_estado, snake_case) al shape camelCase que consumen
 * las pantallas del Centralizador (tarjetas P1, cabecera de documento P2/P3).
 */

/**
 * @param {Object} row fila snake_case del dashboard de paralelos
 * @returns {{ paraleloGestionId:number|null, paraleloNombre, carreraId,
 *   carreraNombre, carreraColorHex, periodoNombre, turno, asignaturasRequeridas,
 *   cursosCreados, cantidadDocentes }}
 */
export const normalizarParaleloCentralizador = (row) => ({
  paraleloGestionId:
    row.paralelo_gestion_id != null ? Number(row.paralelo_gestion_id) : null,
  paraleloNombre: row.paralelo_nombre ?? null,
  // Identificador de carrera (la vista 87 trae carrera_id en la fila cruda):
  // permite agrupar paralelos por carrera en la exportación del centralizador.
  carreraId: row.carrera_id != null ? Number(row.carrera_id) : null,
  carreraNombre: row.carrera_nombre ?? null,
  carreraColorHex: row.carrera_color_hex ?? null,
  periodoNombre: row.periodo_nombre ?? null,
  turno: row.turno ?? null,
  asignaturasRequeridas:
    row.asignaturas_requeridas != null ? Number(row.asignaturas_requeridas) : null,
  // Asignaturas efectivamente ofertadas en el paralelo (oferta_cursos).
  cursosCreados: row.cursos_creados != null ? Number(row.cursos_creados) : null,
  // Docentes distintos con asignación vigente en el paralelo (vista 87).
  cantidadDocentes: row.cantidad_docentes != null ? Number(row.cantidad_docentes) : null,
  // Estudiantes matriculados activos (INSCRITO/CURSANDO). 0 ⇒ paralelo vacío
  // (la tarjeta se marca inactiva para no entrar a una lista sin alumnos).
  cantidadEstudiantes:
    row.cantidad_estudiantes != null ? Number(row.cantidad_estudiantes) : null,
});

/** Normaliza y filtra la colección, descartando filas sin paralelo_gestion_id. */
export const normalizarParalelosCentralizador = (rows = []) =>
  (Array.isArray(rows) ? rows : [])
    .map(normalizarParaleloCentralizador)
    .filter((p) => p.paraleloGestionId != null);

/**
 * Etiqueta corta del paralelo para breadcrumbs / títulos: carrera · curso ·
 * Paralelo X. Tolerante a campos nulos.
 */
export const etiquetaParalelo = (p) => {
  if (!p) return null;
  const partes = [];
  if (p.carreraNombre) partes.push(p.carreraNombre);
  if (p.periodoNombre) partes.push(p.periodoNombre);
  if (p.paraleloNombre) partes.push(`Paralelo ${p.paraleloNombre}`);
  return partes.join(' · ') || null;
};

/**
 * Etiqueta CORTA del paralelo para breadcrumbs: solo "Paralelo X" (sin carrera
 * ni curso, que ya viven en la cabecera de contexto). Null si no hay nombre.
 */
export const etiquetaParaleloCorta = (p) =>
  p?.paraleloNombre ? `Paralelo ${p.paraleloNombre}` : null;
