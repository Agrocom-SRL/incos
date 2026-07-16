import { ConflictError, NotFoundError } from '../../../domain/errors/AppError.js';
import { ESTADOS_INSCRIPCION_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';

/**
 * Use Case: DeleteCursoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Elimina (soft delete) un curso de capacitación. Bloquea la eliminación si
 * el curso tiene inscripciones vigentes (estado INSCRITO, activas): primero
 * deben retirarse/eliminarse las inscripciones.
 */
export class DeleteCursoCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionRepository
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {ILogger} params.logger
   */
  constructor({ cursoCapacitacionRepository, inscripcionCapacitacionRepository, logger }) {
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del curso
   * @param {number|null} userId - Usuario que elimina (auditoría)
   * @returns {Promise<boolean>}
   */
  async execute(id, userId = null) {
    const existing = await this.cursoCapacitacionRepository.findById(id, { paranoid: false });
    if (!existing) throw new NotFoundError('curso de capacitación');

    const inscritosVigentes = await this.inscripcionCapacitacionRepository.count({
      capacitacionId: id,
      estado: ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
    });
    if (inscritosVigentes > 0) {
      throw new ConflictError(
        `No se puede eliminar el curso: tiene ${inscritosVigentes} inscripción(es) vigente(s). Retire o elimine las inscripciones primero.`
      );
    }

    const ok = await this.cursoCapacitacionRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('curso de capacitación');

    this.logger.info('[Capacitación] Curso de capacitación eliminado', { id });
    return true;
  }
}
