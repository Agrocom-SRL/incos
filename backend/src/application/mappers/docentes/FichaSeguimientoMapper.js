/**
 * Mapper de aplicación: FichaSeguimiento (módulo DOC · supervisión docente)
 *
 * - toListItem / listadoRowsToPresentation: filas crudas (snake_case) de la
 *   vista 174 (vista_supervision_fichas_listado) → presentación camelCase.
 *   Nombres de persona ya vienen armados desde la vista en orden institucional
 *   APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
 * - toDetail: entidad raíz camelCase (FichaSeguimientoClaseRepository.toEntity,
 *   con los TEXT de observaciones) + fila de contexto de la vista 174.
 * - toPersistence: payload del cliente → datos a persistir. `supervisorId` se
 *   fija SIEMPRE desde la sesión (req.usuario.id) y JAMÁS se acepta del
 *   cliente (anti-suplantación del evaluador).
 */

/**
 * Fila de la vista 174 (listado de fichas) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function toListItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    fechaSeguimiento: row.fecha_seguimiento ?? null,
    claseObservada: row.clase_observada ?? null,
    asignacionDocenteId: row.asignacion_docente_id ?? null,
    docenteId: row.docente_id ?? null,
    docenteNombre: row.docente_nombre ?? null,
    asignaturaNombre: row.asignatura_nombre ?? null,
    asignaturaSigla: row.asignatura_sigla ?? null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    paraleloPeriodoNombre: row.paralelo_periodo_nombre ?? null,
    paraleloNombre: row.paralelo_nombre ?? null,
    paraleloTurno: row.paralelo_turno ?? null,
    gestionId: row.gestion_id ?? null,
    gestionNombre: row.gestion_nombre ?? null,
    gestionAnio: row.gestion_anio ?? null,
    supervisorId: row.supervisor_id ?? null,
    evaluadorNombre: row.evaluador_nombre ?? null,
    docsPresentados: Number(row.docs_presentados ?? 0),
    docsCompletos: row.docs_completos ?? '0/4',
    estudiantesEnPlanilla:
      row.estudiantes_en_planilla !== null && row.estudiantes_en_planilla !== undefined
        ? Number(row.estudiantes_en_planilla)
        : null,
    estudiantesAsistentes:
      row.estudiantes_asistentes !== null && row.estudiantes_asistentes !== undefined
        ? Number(row.estudiantes_asistentes)
        : null,
  };
}

/**
 * Filas de la vista 174 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function listadoRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(toListItem);
}

/**
 * Ficha completa: entidad raíz (todos los campos del formulario, incluidos
 * los TEXT) + contexto de cabecera desde la vista 174 (si está disponible).
 *
 * @param {Object} entity - Entidad camelCase del repositorio CRUD
 * @param {Object|null} [row] - Fila de la vista 174 (contexto), opcional
 * @returns {Object|null}
 */
export function toDetail(entity, row = null) {
  if (!entity) return null;
  const contexto = row ? toListItem(row) : {};
  return {
    ...contexto,
    id: entity.id,
    asignacionDocenteId: entity.asignacionDocenteId ?? contexto.asignacionDocenteId ?? null,
    supervisorId: entity.supervisorId ?? contexto.supervisorId ?? null,
    fechaSeguimiento: entity.fechaSeguimiento ?? null,
    claseObservada: entity.claseObservada ?? null,
    tieneCronogramaBimestral: entity.tieneCronogramaBimestral ?? null,
    tienePlanBimestral: entity.tienePlanBimestral ?? null,
    tieneRegistroAsistencia: entity.tieneRegistroAsistencia ?? null,
    tieneRegistroPedagogico: entity.tieneRegistroPedagogico ?? null,
    obsDocumentacion: entity.obsDocumentacion ?? null,
    estudiantesEnPlanilla: entity.estudiantesEnPlanilla ?? null,
    estudiantesAsistentes: entity.estudiantesAsistentes ?? null,
    obsAvanceAsignatura: entity.obsAvanceAsignatura ?? null,
    obsPresentacionTema: entity.obsPresentacionTema ?? null,
    obsRecursos: entity.obsRecursos ?? null,
    obsExposicion: entity.obsExposicion ?? null,
    obsParticipacion: entity.obsParticipacion ?? null,
    obsActividadesPracticas: entity.obsActividadesPracticas ?? null,
    obsActividadesEvaluacion: entity.obsActividadesEvaluacion ?? null,
    otrasObservaciones: entity.otrasObservaciones ?? null,
    createdAt: entity.createdAt ?? null,
    updatedAt: entity.updatedAt ?? null,
  };
}

/**
 * Payload del cliente → datos a persistir. Solo campos del formulario; NUNCA
 * toma supervisorId del cliente (se inyecta desde la sesión con
 * `{ supervisorId }` en options, y solo en creación).
 *
 * @param {Object} payload - Body camelCase del request
 * @param {Object} [options]
 * @param {number|null} [options.supervisorId] - Usuario evaluador de la SESIÓN
 * @returns {Object}
 */
export function toPersistence(payload = {}, { supervisorId } = {}) {
  const data = {};
  const copyIf = (key) => {
    if (key in payload) data[key] = payload[key];
  };

  copyIf('asignacionDocenteId');
  copyIf('fechaSeguimiento');
  copyIf('claseObservada');
  copyIf('tieneCronogramaBimestral');
  copyIf('tienePlanBimestral');
  copyIf('tieneRegistroAsistencia');
  copyIf('tieneRegistroPedagogico');
  copyIf('obsDocumentacion');
  copyIf('estudiantesEnPlanilla');
  copyIf('estudiantesAsistentes');
  copyIf('obsAvanceAsignatura');
  copyIf('obsPresentacionTema');
  copyIf('obsRecursos');
  copyIf('obsExposicion');
  copyIf('obsParticipacion');
  copyIf('obsActividadesPracticas');
  copyIf('obsActividadesEvaluacion');
  copyIf('otrasObservaciones');

  if (supervisorId !== undefined && supervisorId !== null) {
    data.supervisorId = supervisorId;
  }

  return data;
}

/**
 * Clase mapper para FichaSeguimiento (patrón del módulo)
 */
export class FichaSeguimientoMapper {
  static toListItem(row) {
    return toListItem(row);
  }

  static listadoRowsToPresentation(rows) {
    return listadoRowsToPresentation(rows);
  }

  static toDetail(entity, row = null) {
    return toDetail(entity, row);
  }

  static toPersistence(payload, options = {}) {
    return toPersistence(payload, options);
  }
}
