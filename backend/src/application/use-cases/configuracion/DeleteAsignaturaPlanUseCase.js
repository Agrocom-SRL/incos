import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';

export class DeleteAsignaturaPlanUseCase {
  /**
   * @param {Object} deps
   * @param {Object} deps.planSubjectRepository
   * @param {Object} [deps.prerequisiteRepository] si se inyecta, impide borrar una asignatura con prerrequisitos
   * @param {Object} deps.logger
   */
  constructor({ planSubjectRepository, prerequisiteRepository = null, logger }) {
    this.planSubjectRepository = planSubjectRepository;
    this.prerequisiteRepository = prerequisiteRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const asignaturaId = parseIdPositivo(id, 'id');

    if (this.prerequisiteRepository) {
      const [comoAsignatura, comoPrerrequisito] = await Promise.all([
        this.prerequisiteRepository.count({ subjectId: asignaturaId }),
        this.prerequisiteRepository.count({ prerequisiteId: asignaturaId }),
      ]);
      if (comoAsignatura > 0 || comoPrerrequisito > 0) {
        throw new ValidationError(
          'No se puede eliminar: la asignatura tiene prerrequisitos definidos o es prerrequisito de otra'
        );
      }
    }

    const ok = await this.planSubjectRepository.delete(asignaturaId, userId);
    if (!ok) throw new NotFoundError('asignatura_plan');
    this.logger?.info('Asignatura del plan eliminada', { id: asignaturaId });
    return true;
  }
}
