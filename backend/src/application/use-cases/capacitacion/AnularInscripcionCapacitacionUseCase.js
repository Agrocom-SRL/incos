import { ConflictError, NotFoundError } from '../../../domain/errors/AppError.js';
import { ESTADOS_INSCRIPCION_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';
import { InscripcionCapacitacionMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: AnularInscripcionCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Transición manual de negocio hacia ANULADO (POST
 * /inscripciones-capacitacion/:id/anular, permiso capacitacion.inscripcion
 * ACCIÓN EDITAR — no existe acción ANULAR en el vocabulario cerrado de
 * permiso_acciones/roles_permisos). SIEMPRE es una decisión administrativa
 * explícita — nunca un efecto automático de que un compromiso quede INCUMPLIDO.
 *
 * Al anular: el monto ya pagado en `capacitacion_pagos` NO se toca (sin
 * reembolso, sin borrar el pago); solo cambia `capacitacion_inscritos.estado`.
 * Solo se puede anular desde PENDIENTE o INSCRITO (no desde RETIRADO/ANULADO).
 */
export class AnularInscripcionCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {ILogger} params.logger
   */
  constructor({ inscripcionCapacitacionRepository, logger }) {
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID de la inscripción
   * @param {Object} body - { observacion? } — solo se registra en el log de
   *   auditoría: el schema de `capacitacion_inscritos` no tiene una columna
   *   propia para esta observación (ver decisión documentada en el reporte).
   * @param {number|null} userId - Usuario que anula (auditoría)
   * @returns {Promise<{inscripcionCapacitacion: Object}>}
   */
  async execute(id, body = {}, userId = null) {
    const inscripcion = await this.inscripcionCapacitacionRepository.findById(id);
    if (!inscripcion) throw new NotFoundError('inscripción de capacitación');

    const ESTADOS_ANULABLES = [
      ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
      ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
    ];
    if (!ESTADOS_ANULABLES.includes(inscripcion.estado)) {
      throw new ConflictError(
        `La inscripción no puede anularse desde su estado actual (${inscripcion.estado})`
      );
    }

    const actualizado = await this.inscripcionCapacitacionRepository.update(
      id,
      { estado: ESTADOS_INSCRIPCION_CAPACITACION.ANULADO },
      userId
    );

    this.logger.info('[Capacitación] Inscripción anulada (decisión administrativa manual)', {
      id,
      estadoAnterior: inscripcion.estado,
      observacion: body.observacion ?? null,
    });

    return {
      inscripcionCapacitacion: InscripcionCapacitacionMapper.entityToPresentation(actualizado),
    };
  }
}
