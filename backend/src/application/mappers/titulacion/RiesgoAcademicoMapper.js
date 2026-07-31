/**
 * Mapper de aplicación: RiesgoAcademico (módulo TUT · acompañamiento)
 *
 * Convierte filas crudas (snake_case) de las vistas 156/157/158 al formato
 * de presentación camelCase.
 */

/** @param {*} value @returns {number|null} */
function toNumberOrNull(value) {
  return value !== null && value !== undefined ? Number(value) : null;
}

/**
 * Fila de la vista 156 (alerta estudiante × materia) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function alertaRowToPresentation(row) {
  if (!row) return null;
  return {
    gestionId: row.gestion_id ?? null,
    paraleloGestionId: row.paralelo_gestion_id ?? null,
    ofertaCursoId: row.oferta_curso_id ?? null,
    asignacionDocenteId: row.asignacion_docente_id ?? null,
    estudianteId: row.estudiante_id ?? null,
    codigoEstudiante: row.codigo_estudiante ?? null,
    nombreCompleto: row.nombre_completo ?? null,
    matriculaMateriaId: row.matricula_materia_id ?? null,
    asignaturaSigla: row.asignatura_sigla ?? null,
    asignaturaNombre: row.asignatura_nombre ?? null,
    docenteNombre: row.docente_nombre ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    carreraColorHex: row.carrera_color_hex ?? null,
    bim1: toNumberOrNull(row.bim1),
    bim2: toNumberOrNull(row.bim2),
    bim3: toNumberOrNull(row.bim3),
    bim4: toNumberOrNull(row.bim4),
    promedioAnual: toNumberOrNull(row.promedio_anual),
    notaFinal: toNumberOrNull(row.nota_final),
    matriculaEstado: row.matricula_estado ?? null,
    notaUltimoBimestre: toNumberOrNull(row.nota_ultimo_bimestre),
    umbralRiesgo: toNumberOrNull(row.umbral_riesgo),
    enRiesgo: Number(row.en_riesgo ?? 0) === 1,
  };
}

/**
 * Filas de la vista 156 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function alertaRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(alertaRowToPresentation);
}

/**
 * Fila de la vista 157 (riesgo por carrera) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function riesgoCarreraRowToPresentation(row) {
  if (!row) return null;
  return {
    gestionId: row.gestion_id ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    carreraColorHex: row.carrera_color_hex ?? null,
    totalMatriculasMateria: Number(row.total_matriculas_materia ?? 0),
    matriculasEnRiesgo: Number(row.matriculas_en_riesgo ?? 0),
    totalEstudiantes: Number(row.total_estudiantes ?? 0),
    estudiantesEnRiesgo: Number(row.estudiantes_en_riesgo ?? 0),
    pctEstudiantesRiesgo: toNumberOrNull(row.pct_estudiantes_riesgo),
  };
}

/**
 * Fila de la vista 158 (reprobación por materia) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function reprobacionMateriaRowToPresentation(row) {
  if (!row) return null;
  return {
    gestionId: row.gestion_id ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    carreraColorHex: row.carrera_color_hex ?? null,
    ofertaCursoId: row.oferta_curso_id ?? null,
    asignaturaSigla: row.asignatura_sigla ?? null,
    asignaturaNombre: row.asignatura_nombre ?? null,
    docenteNombre: row.docente_nombre ?? null,
    matriculados: Number(row.matriculados ?? 0),
    enRiesgo: Number(row.en_riesgo ?? 0),
    reprobados: Number(row.reprobados ?? 0),
    pctRiesgo: toNumberOrNull(row.pct_riesgo),
    pctReprobacion: toNumberOrNull(row.pct_reprobacion),
  };
}

/**
 * Clase mapper para RiesgoAcademico (patrón del módulo)
 */
export class RiesgoAcademicoMapper {
  static alertaRowToPresentation(row) {
    return alertaRowToPresentation(row);
  }

  static alertaRowsToPresentation(rows) {
    return alertaRowsToPresentation(rows);
  }

  static riesgoCarreraRowsToPresentation(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map(riesgoCarreraRowToPresentation);
  }

  static reprobacionMateriaRowsToPresentation(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map(reprobacionMateriaRowToPresentation);
  }
}
