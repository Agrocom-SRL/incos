/**
 * Mapper de aplicación: TutoriaAvance (módulo TIT · titulación, extensión
 * 2026-07-31)
 *
 * Convierte filas crudas (snake_case) de las vistas 178/179/181 al formato de
 * presentación camelCase, compartido por los 3 requisitos:
 * - Requisito 1 (formulario de modalidad de graduación): estudiantes
 *   elegibles de 3er año (vista 178).
 * - Requisito 2 (reporte de avance por carrera): resumen agregado (vista 179).
 * - Requisito 3 (planilla "10 en 10"): roster por bimestre (vista 181).
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
 * Fila de la vista 181 (roster de 3er año por bimestre) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function planillaRowToPresentation(row) {
  if (!row) return null;
  return {
    estudianteId: row.estudiante_id,
    ci: row.ci ?? null,
    expedicion: row.expedicion ?? null,
    nombres: row.nombres ?? null,
    apellidoPaterno: row.apellido_paterno ?? null,
    apellidoMaterno: row.apellido_materno ?? null,
    nombreCompleto: row.estudiante_nombre_completo ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    gestionId: row.gestion_id ?? null,
    proyectoGradoId: row.proyecto_grado_id ?? null,
    proyectoEstado: row.proyecto_estado ?? null,
    tutorNombre: row.tutor_nombre ?? null,
    bimestre: row.bimestre != null ? Number(row.bimestre) : null,
    totalTutoriasBimestre: Number(row.total_tutorias_bimestre ?? 0),
    porcentajeAvance: row.porcentaje_avance != null ? Number(row.porcentaje_avance) : null,
    ultimaObservacion: row.ultima_observacion ?? null,
    resultadoTutoria: row.resultado_tutoria ?? null,
  };
}

/**
 * Filas de la vista 181 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function planillaRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(planillaRowToPresentation);
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

  static planillaRowToPresentation(row) {
    return planillaRowToPresentation(row);
  }

  static planillaRowsToPresentation(rows) {
    return planillaRowsToPresentation(rows);
  }
}
