/**
 * Mapper de aplicación: CursoCapacitacion (módulo CAP)
 *
 * Convierte:
 * - Filas de la vista 155 (`vista_cursos_capacitacion_listado`, snake_case) →
 *   formato de presentación (camelCase) para el listado/ficha.
 * - Filas de la vista 154 (`vista_base_cursos_capacitacion_horarios`) →
 *   bloques horarios de la ficha.
 * - Entidades del repositorio CRUD → presentación (respuestas de crear/editar).
 */

/**
 * Convierte una fila de la vista 155 a formato de presentación.
 * @param {Object|null} row - Fila cruda snake_case de la vista
 * @returns {Object|null}
 */
export function viewRowToPresentation(row) {
  if (!row) return null;

  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion ?? null,
    costo: row.costo !== null && row.costo !== undefined ? Number(row.costo) : null,
    cupoMaximo: row.cupo_maximo,
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    estado: row.estado,
    aulaId: row.aula_id ?? null,
    aulaCodigo: row.aula_codigo ?? null,
    aulaNombre: row.aula_nombre ?? null,
    inscritosCount: Number(row.inscritos_count ?? 0),
    cupoDisponible: Number(row.cupo_disponible ?? 0),
    horariosCount: Number(row.horarios_count ?? 0),
    horariosDetalle: row.horarios_detalle ?? null,
    activo: Boolean(row.activo),
    createdAt: row.created_at,
  };
}

/**
 * Convierte un array de filas de la vista 155 a presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function viewRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(viewRowToPresentation);
}

/**
 * Convierte una fila de la vista 154 (bloque horario) a presentación.
 * @param {Object|null} row - Fila cruda snake_case de la vista
 * @returns {Object|null}
 */
export function horarioRowToPresentation(row) {
  if (!row) return null;

  return {
    capacitacionHorarioId: row.capacitacion_horario_id,
    horarioId: row.horario_id,
    ordenSecuencia: row.orden_secuencia,
    horarioNombre: row.horario_nombre ?? null,
    dia: row.dia,
    diaAbreviado: row.dia_abreviado,
    diaOrden: row.dia_orden !== null && row.dia_orden !== undefined ? Number(row.dia_orden) : null,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    bloqueEtiqueta: row.bloque_etiqueta,
    aulaId: row.aula_id ?? null,
    aulaCodigo: row.aula_codigo ?? null,
    aulaNombre: row.aula_nombre ?? null,
  };
}

/**
 * Convierte un array de filas de la vista 154 a presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function horarioRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(horarioRowToPresentation);
}

/**
 * Convierte una entidad del repositorio CRUD (objeto de dominio) a presentación.
 * Usada en respuestas de crear/editar/toggle (sin agregados de la vista).
 * @param {Object|null} entity
 * @returns {Object|null}
 */
export function entityToPresentation(entity) {
  if (!entity) return null;

  return {
    id: entity.id,
    titulo: entity.titulo,
    descripcion: entity.descripcion ?? null,
    costo: entity.costo !== null && entity.costo !== undefined ? Number(entity.costo) : null,
    cupoMaximo: entity.cupoMaximo,
    fechaInicio: entity.fechaInicio,
    fechaFin: entity.fechaFin,
    estado: entity.estado,
    aulaId: entity.aulaId ?? null,
    activo: entity.activo,
    createdAt: entity.createdAt,
  };
}

/**
 * Clase mapper para CursoCapacitacion (patrón del módulo)
 */
export class CursoCapacitacionMapper {
  static viewRowToPresentation(row) {
    return viewRowToPresentation(row);
  }

  static viewRowsToPresentation(rows) {
    return viewRowsToPresentation(rows);
  }

  static horarioRowToPresentation(row) {
    return horarioRowToPresentation(row);
  }

  static horarioRowsToPresentation(rows) {
    return horarioRowsToPresentation(rows);
  }

  static entityToPresentation(entity) {
    return entityToPresentation(entity);
  }
}
