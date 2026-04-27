import { teacherDomainFromApiBody } from '../../mappers/docentes/TeacherPayloadMapper.js';

/**
 * POST /api/v1/docentes — alta de docente.
 */
export class CreateTeacherUseCase {
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
   * @param {Object} body - Cuerpo HTTP (campos en español)
   * @param {number|null} userId
   * @returns {Promise<{ docente: { id: number } }>}
   */
  async execute(body, userId = null) {
    this.logger.info('[Docentes] Crear docente', { userId });
    const domain = teacherDomainFromApiBody(body);
    const entity = await this.teacherRepository.create(domain, userId);
    return { docente: { id: entity.id } };
  }
}
