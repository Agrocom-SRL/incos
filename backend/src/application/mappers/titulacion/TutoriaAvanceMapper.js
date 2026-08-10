/**
 * Mapper de aplicación: TutoriaAvance (módulo TIT · titulación)
 *
 * Convierte filas crudas (snake_case) de las vistas 178/179/181(+180) al
 * formato de presentación camelCase, compartido por:
 * - Requisito 1 (formulario de modalidad de graduación): estudiantes
 *   elegibles de 3er año (vista 178).
 * - Requisito 2 (reporte de avance por carrera): resumen agregado (vista 179).
 * - Seguimiento de tutorías a docentes (2026-08-10, reemplaza la planilla de
 *   avance "10 en 10" de 3er año): roster de tutoriados por docente-tutor
 *   (vista 181 + agregado mensual de la 180, resuelto en el repositorio).
 *
 * Los nombres de personas ya vienen armados en orden institucional
 * (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES) desde las vistas base
 * (`estudiante_nombre_completo`, mismo criterio que `buildFullName`).
 */

/**
 * Fila de la vista 178 (estudiante de 3er año elegible) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function estudianteElegibleRowToPresentation(row) {
  if (!row) return null;
  return {
    estudianteId: row.estudiante_id,
    ci: row.ci ?? null,
    expedicion: row.expedicion ?? null,
    celular: row.celular ?? null,
    nombres: row.nombres ?? null,
    apellidoPaterno: row.apellido_paterno ?? null,
    apellidoMaterno: row.apellido_materno ?? null,
    nombreCompleto: row.estudiante_nombre_completo ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    gestionId: row.gestion_id ?? null,
    periodoNumero: row.periodo_numero != null ? Number(row.periodo_numero) : null,
  };
}

/**
 * Filas de la vista 178 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function estudiantesElegiblesRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(estudianteElegibleRowToPresentation);
}

/**
 * Fila de la vista 179 (resumen de avance por carrera) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function avanceCarreraRowToPresentation(row) {
  if (!row) return null;
  return {
    gestionId: row.gestion_id ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    totalProyectos: Number(row.total_proyectos ?? 0),
    promedioAvance: row.promedio_avance != null ? Number(row.promedio_avance) : null,
    proyectosConObservacionesPendientes: Number(row.proyectos_con_observaciones_pendientes ?? 0),
  };
}

/**
 * Filas de la vista 179 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function avanceCarreraRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(avanceCarreraRowToPresentation);
}

/**
 * Fila del roster de seguimiento a docentes (vista 181 + agregado mensual de
 * la 180, ya combinados en `TutoriaAvanceViewRepository.findSeguimientoTutoriaDocentes`)
 * → presentación. Grano: un tutoriado ACTIVO de un proyecto con tutor,
 * dentro del mes/año consultado.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function seguimientoDocenteRowToPresentation(row) {
  if (!row) return null;
  return {
    estudianteId: row.estudiante_id,
    ci: row.ci ?? null,
    expedicion: row.expedicion ?? null,
    nombreCompleto: row.estudiante_nombre_completo ?? null,
    proyectoGradoId: row.proyecto_grado_id ?? null,
    proyectoTitulo: row.proyecto_titulo ?? null,
    proyectoEstado: row.proyecto_estado ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    docenteId: row.tutor_id ?? null,
    docenteNombre: row.tutor_nombre ?? null,
    tutoriasEjecutadasMes: Number(row.tutorias_ejecutadas_mes ?? 0),
    porcentajeAvance: row.porcentaje_avance != null ? Number(row.porcentaje_avance) : null,
    ultimaActividad: row.ultima_actividad ?? null,
    ultimaObservacion: row.ultima_observacion ?? null,
  };
}

/**
 * Filas del roster de seguimiento a docentes → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function seguimientoDocentesRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(seguimientoDocenteRowToPresentation);
}

/**
 * Clase mapper para TutoriaAvance (patrón del módulo)
 */
export class TutoriaAvanceMapper {
  static estudianteElegibleRowToPresentation(row) {
    return estudianteElegibleRowToPresentation(row);
  }

  static estudiantesElegiblesRowsToPresentation(rows) {
    return estudiantesElegiblesRowsToPresentation(rows);
  }

  static avanceCarreraRowToPresentation(row) {
    return avanceCarreraRowToPresentation(row);
  }

  static avanceCarreraRowsToPresentation(rows) {
    return avanceCarreraRowsToPresentation(rows);
  }

  static seguimientoDocenteRowToPresentation(row) {
    return seguimientoDocenteRowToPresentation(row);
  }

  static seguimientoDocentesRowsToPresentation(rows) {
    return seguimientoDocentesRowsToPresentation(rows);
  }
}
