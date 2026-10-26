/**
 * Caso de uso: detalle de docente con asignaciones y horarios (vista de ficha).
 */

import { NotFoundError } from '../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
import { TeacherDetailPresentationMapper } from '../../mappers/docentes/TeacherDetailPresentationMapper.js';

export class GetTeacherDetailUseCase {
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
   * @param {number} teacherId
   * @returns {Promise<Object>}
   */
  async execute(rawTeacherId) {
    const teacherId = parseIdPositivo(rawTeacherId, 'id');
    this.logger.info('[Docentes] Detalle docente', { teacherId });
    const bundle = await this.teacherRepository.findDetailBundleByTeacherId(teacherId);
    if (!bundle?.teacher) {
      throw new NotFoundError('Docente');
    }
    return TeacherDetailPresentationMapper.toResponse(bundle);
  }
}
