import { NotFoundError } from '../../../domain/errors/AppError.js';
import { teacherDomainFromApiBody } from '../../mappers/docentes/TeacherPayloadMapper.js';

/**
 * PUT /api/v1/docentes/:id — actualización de docente.
 */
export class UpdateTeacherUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/TeacherRepository.js').TeacherRepository} deps.teacherRepository
   * @param {Object} deps.logger
   */
  constructor({ teacherRepository, logger }) {
    this.teacherRepository = teacherRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {Object} body
   * @param {number|null} userId
   * @returns {Promise<{ docente: { id: number } }>}
   */
  async execute(id, body, userId = null) {
    this.logger.info('[Docentes] Actualizar docente', { id, userId });
    const existing = await this.teacherRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Docente');
    }
    const domain = teacherDomainFromApiBody(body);
    const entity = await this.teacherRepository.update(id, domain, userId);
    if (!entity) {
      throw new NotFoundError('Docente');
    }
    return { docente: { id: entity.id } };
  }
}
