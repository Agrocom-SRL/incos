import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ESTADOS_INSCRIPCION_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';

/**
 * Use Case: DeleteInscripcionCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Elimina una inscripción (soft delete, mismo patrón que la matrícula formal:
 * la cabecera se elimina junto con sus hijos). En UNA transacción:
 * 1. Marca la inscripción como RETIRADO (semántica de negocio conservada en
 *    la fila soft-deleted).
 * 2. Soft-delete de sus pagos (`capacitacion_pagos`).
 * 3. Soft-delete de la inscripción.
 */
export class DeleteInscripcionCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {Object} params.pagoCapacitacionRepository
   * @param {ILogger} params.logger
   */
  constructor({ inscripcionCapacitacionRepository, pagoCapacitacionRepository, logger }) {
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID de la inscripción
   * @param {number|null} userId - Usuario que elimina (auditoría)
   * @returns {Promise<boolean>}
   */
  async execute(id, userId = null) {
    const inscripcion = await this.inscripcionCapacitacionRepository.findById(id);
    if (!inscripcion) throw new NotFoundError('inscripción de capacitación');

    // Pagos vigentes de la inscripción (para el soft delete en cascada)
    const pagos = await this.pagoCapacitacionRepository.findAll(
      { capacitacionInscritoId: id },
      null,
      null
    );
    const pagosVigentes = pagos.pagosCapacitacion ?? [];

    await sequelize.transaction(async (transaction) => {
      // 1. Semántica de negocio: la inscripción queda RETIRADO antes del borrado
      await this.inscripcionCapacitacionRepository.update(
        id,
        { estado: ESTADOS_INSCRIPCION_CAPACITACION.RETIRADO },
        userId,
        { transaction }
      );

      // 2. Soft-delete en cascada de los pagos
      await Promise.all(
        pagosVigentes.map((pago) => this.pagoCapacitacionRepository.delete(pago.id, userId))
      );

      // 3. Soft-delete de la inscripción
      await this.inscripcionCapacitacionRepository.delete(id, userId);
    });

    this.logger.info('[Capacitación] Inscripción eliminada (soft delete)', {
      id,
      pagosEliminados: pagosVigentes.length,
    });

    return true;
  }
}
