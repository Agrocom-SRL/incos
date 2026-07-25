/**
 * Mapper de aplicación: SesionReforzamiento (módulo TUT · acompañamiento)
 *
 * Convierte filas crudas (snake_case) de la vista 161, del join de
 * participantes (⋈ vista 156) y de la vista 162 al formato camelCase.
 */

/** @param {*} value @returns {number|null} */
function toNumberOrNull(value) {
  return value !== null && value !== undefined ? Number(value) : null;
}

/**
 * Fila de la vista 161 (sesión enriquecida) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function viewRowToPresentation(row) {
  if (!row) return null;
  return {
    id: row.sesion_id,
    fecha: row.fecha ?? null,
    horaInicio: row.hora_inicio ?? null,
    horaFin: row.hora_fin ?? null,
    modalidad: row.modalidad ?? null,
    aulaId: row.aula_id ?? null,
    aulaNombre: row.aula_nombre ?? null,
    enlaceVirtual: row.enlace_virtual ?? null,
    tema: row.tema ?? null,
    estado: row.estado ?? null,
    asignacionDocenteId: row.asignacion_docente_id ?? null,
    ofertaCursoId: row.oferta_curso_id ?? null,
    paraleloGestionId: row.paralelo_gestion_id ?? null,
    gestionId: row.gestion_id ?? null,
    docenteId: row.docente_id ?? null,
    docenteNombre: row.docente_nombre ?? null,
    materiaSigla: row.materia_sigla ?? null,
    materiaNombre: row.materia_nombre ?? null,
    paraleloNombre: row.paralelo_nombre ?? null,
    totalParticipantes: Number(row.total_participantes ?? 0),
    asistieron: Number(row.asistieron ?? 0),
    mejorados: Number(row.mejorados ?? 0),
  };
}

/**
 * Filas de la vista 161 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function viewRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(viewRowToPresentation);
}

/**
 * Fila del join participantes ⋈ vista 156 → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function participanteRowToPresentation(row) {
  if (!row) return null;
  return {
    id: row.participante_id,
    sesionReforzamientoId: row.sesion_reforzamiento_id ?? null,
    matriculaMateriaId: row.matricula_materia_id ?? null,
    origen: row.origen ?? null,
    asistio: row.asistio === null || row.asistio === undefined ? null : Boolean(row.asistio),
    progreso: row.progreso ?? null,
    observaciones: row.observaciones ?? null,
    estudianteId: row.estudiante_id ?? null,
    codigoEstudiante: row.codigo_estudiante ?? null,
    nombreCompleto: row.nombre_completo ?? null,
    notaUltimoBimestre: toNumberOrNull(row.nota_ultimo_bimestre),
    promedioAnual: toNumberOrNull(row.promedio_anual),
    enRiesgo: Number(row.en_riesgo ?? 0) === 1,
  };
}

/**
 * Filas del join de participantes → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function participanteRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(participanteRowToPresentation);
}

/**
 * Fila de la vista 162 (resumen mensual) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function resumenRowToPresentation(row) {
  if (!row) return null;
  return {
    gestionId: row.gestion_id ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    carreraColorHex: row.carrera_color_hex ?? null,
    mes: row.mes ?? null,
    sesionesProgramadas: Number(row.sesiones_programadas ?? 0),
    sesionesRealizadas: Number(row.sesiones_realizadas ?? 0),
    participantes: Number(row.participantes ?? 0),
    asistencias: Number(row.asistencias ?? 0),
    pctAsistencia: toNumberOrNull(row.pct_asistencia),
  };
}

/**
 * Clase mapper para SesionReforzamiento (patrón del módulo)
 */
export class SesionReforzamientoMapper {
  static viewRowToPresentation(row) {
    return viewRowToPresentation(row);
  }

  static viewRowsToPresentation(rows) {
    return viewRowsToPresentation(rows);
  }

  static participanteRowToPresentation(row) {
    return participanteRowToPresentation(row);
  }

  static participanteRowsToPresentation(rows) {
    return participanteRowsToPresentation(rows);
  }

  static resumenRowsToPresentation(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map(resumenRowToPresentation);
  }
}
