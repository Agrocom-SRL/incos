/**
 * Baja lógica de un curso. No permite eliminar si tiene bloques en `cursos_horarios`.
 */
import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

export class DeleteCursoOfertaUseCase {
  constructor({ courseRepository, courseScheduleRepository, logger }) {
    this.courseRepository = courseRepository;
    this.courseScheduleRepository = courseScheduleRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} input
   * @param {number} input.courseId
   * @param {number} [input.parallelId]
   * @param {number|null} userId
   */
  async execute(input, userId = null) {
    const courseId = Number(input?.courseId);
    this.logger.info('[Académico] Eliminar curso (oferta)', { courseId });

    if (!Number.isFinite(courseId) || courseId < 1) {
      throw new ValidationError('ID de curso inválido');
    }

    const curso = await this.courseRepository.findById(courseId);
    if (!curso) {
      throw new NotFoundError('curso');
    }

    if (input.parallelId != null && Number(curso.parallelId) !== Number(input.parallelId)) {
      throw new ValidationError('El curso no pertenece al paralelo indicado');
    }

    let bloquesCount = 0;
    try {
      bloquesCount = await this.courseScheduleRepository.count({ courseId });
    } catch (e) {
      this.logger.warn('[Académico] No se pudo contar bloques del curso a eliminar', { courseId, error: e.message });
    }

    if (bloquesCount > 0) {
      throw new ConflictError(
        'No se puede eliminar el curso mientras tenga horarios (bloques) asignados. Quitá los bloques desde el armado semanal.',
      );
    }

    const ok = await this.courseRepository.delete(courseId, userId);
    if (!ok) {
      throw new NotFoundError('curso');
    }

    return { courseId };
  }
}
