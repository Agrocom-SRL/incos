/**
 * Baja lógica de un curso y sus bloques (`cursos_horarios`) asociados.
 */
import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { Curso as CursoModel } from '../../../infrastructure/database/models/curso.js';
import { CursoHorario as CursoHorarioModel } from '../../../infrastructure/database/models/curso_horario.js';

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

    const result = await sequelize.transaction(async (t) => {
      const cursoModel = await CursoModel.findByPk(courseId, { transaction: t });
      if (!cursoModel) {
        throw new NotFoundError('curso');
      }

      const updateAudit = { activo: false };
      if (userId) updateAudit.deletedBy = userId;

      // 1) Dar de baja todos los bloques del curso.
      await CursoHorarioModel.update(updateAudit, {
        where: { cursoId: courseId },
        transaction: t,
      });
      const deletedBloques = await CursoHorarioModel.destroy({
        where: { cursoId: courseId },
        transaction: t,
      });

      // 2) Dar de baja el curso.
      await CursoModel.update(updateAudit, { where: { id: courseId }, transaction: t });
      await cursoModel.destroy({ transaction: t });

      return { deletedBloques };
    });

    this.logger.info('[Académico] Curso eliminado con sus bloques', {
      courseId,
      deletedBloques: result.deletedBloques,
    });
    return { courseId, deletedBloques: result.deletedBloques };
  }
}
