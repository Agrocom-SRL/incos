/**
 * Mapper de aplicación: InscripcionCapacitacion (módulo CAP)
 *
 * Convierte las filas crudas del listado/ficha (inscripción + participante +
 * curso + total pagado + compromiso, snake_case) a formato de presentación
 * (camelCase). El estado de pago (`estadoPago`) y el monto objetivo
 * (`montoObligatorio`) vienen PERSISTIDOS de `capacitacion_inscritos`, no se
 * derivan aquí (ver reglas de negocio del módulo CAP).
 */

/**
 * Nombre completo en orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
 * @param {Object} row
 * @returns {string}
 */
function buildNombreCompleto(row) {
  return [
    row.participante_apellido_paterno,
    row.participante_apellido_materno,
    row.participante_nombres,
  ]
    .filter((parte) => parte && String(parte).trim() !== '')
    .join(' ');
}

/**
 * Convierte una fila cruda del listado a formato de presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function rowToPresentation(row) {
  if (!row) return null;

  const costo = row.costo !== null && row.costo !== undefined ? Number(row.costo) : 0;
  const montoObligatorio =
    row.monto_obligatorio !== null && row.monto_obligatorio !== undefined
      ? Number(row.monto_obligatorio)
      : 0;
  const totalPagado = Number(row.total_pagado ?? 0);

  return {
    id: row.id,
    fechaInscripcion: row.fecha_inscripcion,
    estado: row.estado,
    activo: Boolean(row.activo),
    participanteId: row.participante_id,
    participanteCi: row.participante_ci,
    participanteExpedicion: row.participante_expedicion ?? null,
    participanteNombres: row.participante_nombres,
    participanteApellidoPaterno: row.participante_apellido_paterno ?? null,
    participanteApellidoMaterno: row.participante_apellido_materno ?? null,
    participanteNombreCompleto: buildNombreCompleto(row),
    participanteCelular: row.participante_celular ?? null,
    participanteEmail: row.participante_email ?? null,
    capacitacionId: row.capacitacion_id,
    capacitacionTitulo: row.capacitacion_titulo,
    capacitacionEstado: row.capacitacion_estado,
    capacitacionFechaInicio: row.capacitacion_fecha_inicio,
    capacitacionFechaFin: row.capacitacion_fecha_fin,
    costo,
    montoObligatorio,
    totalPagado,
    saldo: Math.max(0, montoObligatorio - totalPagado),
    estadoPago: row.estado_pago,
    pagosCount: Number(row.pagos_count ?? 0),
    compromisoId: row.compromiso_id ?? null,
    fechaCompromiso: row.compromiso_fecha ?? null,
    compromisoEstado: row.compromiso_estado ?? null,
    compromisoObservacion: row.compromiso_observacion ?? null,
    createdAt: row.created_at,
  };
}

/**
 * Convierte un array de filas crudas del listado a presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function rowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(rowToPresentation);
}

/**
 * Convierte una entidad del repositorio CRUD (objeto de dominio) a
 * presentación mínima (respuestas de crear/eliminar).
 * @param {Object|null} entity
 * @returns {Object|null}
 */
export function entityToPresentation(entity) {
  if (!entity) return null;

  return {
    id: entity.id,
    participanteId: entity.participanteId,
    capacitacionId: entity.capacitacionId,
    fechaInscripcion: entity.fechaInscripcion,
    estado: entity.estado,
    montoObligatorio: entity.montoObligatorio ?? null,
    estadoPago: entity.estadoPago ?? null,
    activo: entity.activo,
    createdAt: entity.createdAt,
  };
}

/**
 * Clase mapper para InscripcionCapacitacion (patrón del módulo)
 */
export class InscripcionCapacitacionMapper {
  static rowToPresentation(row) {
    return rowToPresentation(row);
  }

  static rowsToPresentation(rows) {
    return rowsToPresentation(rows);
  }

  static entityToPresentation(entity) {
    return entityToPresentation(entity);
  }
}
