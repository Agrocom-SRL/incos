/**
 * Carga y valida el pago de una inscripción para corregirlo o anularlo.
 * Compartido por `UpdatePagoCapacitacionUseCase` y `AnularPagoCapacitacionUseCase`
 * (misma precondición: inscripción vigente, pago propio y no anulado).
 */

import { ConflictError, NotFoundError } from '../../../../domain/errors/AppError.js';
import { ESTADOS_INSCRIPCION_CAPACITACION } from '../../../../domain/constants/capacitacion.constants.js';

const ESTADOS_QUE_PERMITEN_CAMBIAR_PAGOS = [
  ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
  ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
];

/**
 * @param {Object} params
 * @param {Object} params.inscripcionCapacitacionRepository
 * @param {Object} params.pagoCapacitacionRepository
 * @param {number} params.inscripcionId
 * @param {number} params.pagoId
 * @param {string} params.accion - Verbo para el mensaje (ej: 'modificar', 'anular')
 * @param {Object} [params.transaction]
 * @returns {Promise<{inscripcion: Object, pago: Object}>}
 * @throws {NotFoundError} inscripción o pago inexistente / de otra inscripción
 * @throws {ConflictError} inscripción retirada/anulada o pago ya anulado
 */
export async function cargarPagoModificable({
  inscripcionCapacitacionRepository,
  pagoCapacitacionRepository,
  inscripcionId,
  pagoId,
  accion,
  transaction,
}) {
  const inscripcion = await inscripcionCapacitacionRepository.findById(inscripcionId, {
    transaction,
    ...(transaction?.LOCK ? { lock: transaction.LOCK.UPDATE } : {}),
  });
  if (!inscripcion) throw new NotFoundError('inscripción de capacitación');
  if (!ESTADOS_QUE_PERMITEN_CAMBIAR_PAGOS.includes(inscripcion.estado)) {
    throw new ConflictError(
      `No se puede ${accion} un pago de una inscripción retirada o anulada`
    );
  }

  const pago = await pagoCapacitacionRepository.findById(pagoId, { transaction });
  if (!pago || Number(pago.capacitacionInscritoId) !== Number(inscripcionId)) {
    throw new NotFoundError(`pago con ID ${pagoId} de la inscripción ${inscripcionId}`);
  }
  if (pago.anulado) {
    throw new ConflictError(`El pago ${pago.numeroRecibo} ya está anulado y no se puede ${accion}`);
  }
  return { inscripcion, pago };
}

/**
 * Resumen de la inscripción tras recalcular, en el formato de las respuestas de pagos.
 * @param {number} inscripcionId
 * @param {Object} resumen - Resultado de `recalcularEstadoInscripcion`
 * @returns {Object}
 */
export function resumenInscripcion(inscripcionId, resumen) {
  return {
    id: inscripcionId,
    estado: resumen.estado,
    estadoPago: resumen.estadoPago,
    estadoPagoCurso: resumen.estadoPagoCurso,
    estadoPagoMatricula: resumen.estadoPagoMatricula,
    saldoCurso: resumen.saldoCurso,
    saldoMatricula: resumen.saldoMatricula,
  };
}
