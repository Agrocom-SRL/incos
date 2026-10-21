import { ConflictError, NotFoundError } from '../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
import { esHorarioCapacitacion } from './helpers/horarioCapacitacionInput.js';

/**
 * Use Case: DeleteHorarioCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Elimina (soft delete) un horario de capacitación. Si algún curso de
 * capacitación activo lo usa en un grupo, responde 409 con el detalle de los
 * cursos que lo usan.
 */
export class DeleteHorarioCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.scheduleRepository
   * @param {Object} params.bloqueCapacitacionRepository
   * @param {ILogger} params.logger
   */
  constructor({ scheduleRepository, bloqueCapacitacionRepository, logger }) {
    this.scheduleRepository = scheduleRepository;
    this.bloqueCapacitacionRepository = bloqueCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {number|string} id - ID del horario
   * @param {number|null} userId - Usuario que elimina (auditoría)
   * @returns {Promise<number>} ID eliminado
   */
  async execute(id, userId = null) {
    const horarioId = parseIdPositivo(id, 'id del horario');
    const horario = await this.scheduleRepository.findById(horarioId);
    if (!esHorarioCapacitacion(horario)) throw new NotFoundError('horario de capacitación');

    const cursos = await this.bloqueCapacitacionRepository.findCursosQueUsanHorario(horarioId);
    if (cursos.length > 0) {
      const titulos = cursos.map((c) => `"${c.titulo}"`).join(', ');
      throw new ConflictError(
        `No se puede eliminar el horario: lo usan ${cursos.length} curso(s) de capacitación (${titulos}). Quítelo de los grupos primero.`,
        cursos.map((c) => ({ cursoId: c.id, titulo: c.titulo }))
      );
    }

    await this.scheduleRepository.delete(horarioId, userId);
    this.logger.info('[Capacitación] Horario de capacitación eliminado', { id: horarioId });
    return horarioId;
  }
}
