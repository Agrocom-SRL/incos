import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: DeleteParticipanteUseCase
 * Módulo: Capacitación (CAP)
 *
 * Elimina un participante (soft delete) EN CASCADA: primero cada una de sus
 * inscripciones (con sus pagos, vía `DeleteInscripcionCapacitacionUseCase`, la misma
 * regla que eliminar una inscripción suelta) y al final el participante. Así no hay
 * que buscar inscripción por inscripción.
 *
 * Los pagos eliminados dejan de figurar en el registro de ingresos de Finanzas (la
 * vista base de ingresos solo une pagos no eliminados): la UI lo advierte antes de
 * confirmar. Para ocultar a un participante SIN perder su historial ni sus ingresos
 * se usa el estado activo/inactivo.
 *
 * Las inscripciones se eliminan una a una (cada una es atómica); si una falla el
 * participante no se elimina y se puede reintentar sin duplicar nada.
 */
export class DeleteParticipanteUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.participanteRepository
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {Object} params.deleteInscripcionCapacitacionUseCase
   * @param {ILogger} params.logger
   */
  constructor({
    participanteRepository,
    inscripcionCapacitacionRepository,
    deleteInscripcionCapacitacionUseCase,
    logger,
  }) {
    this.participanteRepository = participanteRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.deleteInscripcionCapacitacionUseCase = deleteInscripcionCapacitacionUseCase;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del participante
   * @param {number|null} userId - Usuario que elimina (auditoría)
   * @returns {Promise<boolean>}
   */
  async execute(id, userId = null) {
    const participante = await this.participanteRepository.findById(id);
    if (!participante) throw new NotFoundError('participante');

    const inscripcionIds = await this.inscripcionCapacitacionRepository.findIdsByParticipanteId(id);
    for (const inscripcionId of inscripcionIds) {
      // eslint-disable-next-line no-await-in-loop
      await this.deleteInscripcionCapacitacionUseCase.execute(inscripcionId, userId);
    }

    await this.participanteRepository.delete(id, userId);

    this.logger.info('[Capacitación] Participante eliminado en cascada (soft delete)', {
      id,
      inscripcionesEliminadas: inscripcionIds.length,
    });
    return true;
  }
}

export default DeleteParticipanteUseCase;
