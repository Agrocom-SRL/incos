import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';

export class DeletePeriodoUseCase {
  /**
   * @param {Object} deps
   * @param {Object} deps.periodRepository
   * @param {Object} [deps.planSubjectRepository] si se inyecta, impide borrar un periodo con asignaturas
   * @param {Object} deps.logger
   */
  constructor({ periodRepository, planSubjectRepository = null, logger }) {
    this.periodRepository = periodRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const periodoId = parseIdPositivo(id, 'id');

    if (this.planSubjectRepository) {
      const refs = await this.planSubjectRepository.count({ periodId: periodoId });
      if (refs > 0) {
        throw new ValidationError('No se puede eliminar: el periodo tiene asignaturas del plan asociadas');
      }
    }

    const ok = await this.periodRepository.delete(periodoId, userId);
    if (!ok) throw new NotFoundError('periodo');
    this.logger?.info('Periodo eliminado', { id: periodoId });
    return true;
  }
}
