/**
 * Mapper de aplicación: ProyectoGrado (módulo TUT · titulación)
 *
 * Convierte filas crudas (snake_case) de las vistas 160/159/163 al formato de
 * presentación camelCase. Los nombres de personas ya vienen armados desde las
 * vistas en orden institucional (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES).
 *
 * Las entidades del repositorio CRUD (ProyectoGradoRepository.toEntity) ya son
 * camelCase y se exponen tal cual en las respuestas de crear/editar.
 */

/**
 * Fila de la vista 160 (listado de proyectos) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function listadoRowToPresentation(row) {
  if (!row) return null;
  return {
    id: row.proyecto_grado_id,
    titulo: row.titulo,
    estado: row.proyecto_estado,
    gestionId: row.gestion_id ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    modalidadId: row.modalidad_id ?? null,
    modalidadCodigo: row.modalidad_codigo ?? null,
    modalidadNombre: row.modalidad_nombre ?? null,
    tutorId: row.tutor_id ?? null,
    tutorNombre: row.tutor_nombre ?? null,
    cantidadIntegrantes: Number(row.cantidad_integrantes ?? 0),
    ultimaTutoriaFecha: row.ultima_tutoria_fecha ?? null,
    totalTutorias: Number(row.total_tutorias ?? 0),
    observacionesPendientes: Number(row.observaciones_pendientes ?? 0),
    porcentajeAvance:
      row.porcentaje_avance !== null && row.porcentaje_avance !== undefined
        ? Number(row.porcentaje_avance)
        : null,
    avancesPendientes: Number(row.avances_pendientes ?? 0),
  };
}

/**
 * Filas de la vista 160 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function listadoRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(listadoRowToPresentation);
}

/**
 * Fila de la vista 159 (integrante) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function integranteRowToPresentation(row) {
  if (!row) return null;
  return {
    id: row.integrante_proyecto_id,
    proyectoGradoId: row.proyecto_grado_id,
    rol: row.integrante_rol,
    estado: row.integrante_estado,
    estudianteId: row.estudiante_id ?? null,
    codigoEstudiante: row.codigo_estudiante ?? null,
    estudianteNombre: row.estudiante_nombre ?? null,
  };
}

/**
 * Filas de la vista 159 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function integranteRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(integranteRowToPresentation);
}

/**
 * Fila de la vista 163 (bitácora mensual por tutor) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function bitacoraMensualRowToPresentation(row) {
  if (!row) return null;
  return {
    tutorId: row.tutor_id ?? null,
    tutorNombre: row.tutor_nombre ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    gestionId: row.gestion_id ?? null,
    mes: row.mes ?? null,
    tutoriasRegistradas: Number(row.tutorias_registradas ?? 0),
    tutoriasConfirmadas: Number(row.tutorias_confirmadas ?? 0),
    proyectosAtendidos: Number(row.proyectos_atendidos ?? 0),
  };
}

/**
 * Filas de la vista 163 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function bitacoraMensualRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(bitacoraMensualRowToPresentation);
}

/**
 * Clase mapper para ProyectoGrado (patrón del módulo)
 */
export class ProyectoGradoMapper {
  static listadoRowToPresentation(row) {
    return listadoRowToPresentation(row);
  }

  static listadoRowsToPresentation(rows) {
    return listadoRowsToPresentation(rows);
  }

  static integranteRowToPresentation(row) {
    return integranteRowToPresentation(row);
  }

  static integranteRowsToPresentation(rows) {
    return integranteRowsToPresentation(rows);
  }

  static bitacoraMensualRowToPresentation(row) {
    return bitacoraMensualRowToPresentation(row);
  }

  static bitacoraMensualRowsToPresentation(rows) {
    return bitacoraMensualRowsToPresentation(rows);
  }
}
