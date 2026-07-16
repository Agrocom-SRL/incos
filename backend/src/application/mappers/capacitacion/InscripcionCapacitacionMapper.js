import { ESTADOS_PAGO_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';

/**
 * Mapper de aplicación: InscripcionCapacitacion (módulo CAP)
 *
 * Convierte las filas crudas del listado/ficha (inscripción + participante +
 * curso + total pagado, snake_case) a formato de presentación (camelCase),
 * derivando el estado de pago (PENDIENTE/PARCIAL/PAGADO) de
 * total_pagado vs costo del curso.
 */

/**
 * Deriva el estado de pago de una inscripción.
 * - PAGADO: total pagado cubre el costo (incluye cursos con costo 0)
 * - PARCIAL: hay pagos pero no cubren el costo
 * - PENDIENTE: sin pagos
 *
 * @param {number} costo
 * @param {number} totalPagado
 * @returns {string}
 */
export function deriveEstadoPago(costo, totalPagado) {
  const costoNum = Number(costo ?? 0);
  const pagadoNum = Number(totalPagado ?? 0);

  if (pagadoNum >= costoNum) return ESTADOS_PAGO_CAPACITACION.PAGADO;
  if (pagadoNum > 0) return ESTADOS_PAGO_CAPACITACION.PARCIAL;
  return ESTADOS_PAGO_CAPACITACION.PENDIENTE;
}

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
    totalPagado,
    saldo: Math.max(0, costo - totalPagado),
    estadoPago: deriveEstadoPago(costo, totalPagado),
    pagosCount: Number(row.pagos_count ?? 0),
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

  static deriveEstadoPago(costo, totalPagado) {
    return deriveEstadoPago(costo, totalPagado);
  }
}
