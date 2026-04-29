/**
 * GET /api/v1/docentes/cursos/:cursoId/horarios — bloques de horario + aula de un curso.
 */

import { NotFoundError } from '../../../domain/errors/index.js';

export class GetCursoHorariosDocenteUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/CourseRepository.js').CourseRepository} deps.courseRepository
   * @param {import('../../../infrastructure/repositories/CourseScheduleRepository.js').CourseScheduleRepository} deps.courseScheduleRepository
   * @param {Object} deps.logger
   */
  constructor({ courseRepository, courseScheduleRepository, logger }) {
    this.courseRepository = courseRepository;
    this.courseScheduleRepository = courseScheduleRepository;
    this.logger = logger;
  }

  async execute(cursoId) {
    const id = Number(cursoId);
    if (!Number.isFinite(id) || id < 1) {
      throw new NotFoundError('Curso');
    }

    this.logger.info('[Docentes] Horarios de curso (asignación)', { cursoId: id });

    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Curso');
    }

    const bloques = await this.courseScheduleRepository.findBloquesByCursoIdForPresentation(id);
    return {
      bloques,
      cursoId: id,
      cursoCodigo: course.code ?? null,
      cursoColorHex: course.colorHex ?? null,
    };
  }
}
