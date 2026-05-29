import { NotFoundError } from '../../../domain/errors/index.js';
import { TeacherAssignmentPresentationMapper } from '../../mappers/docentes/TeacherAssignmentPresentationMapper.js';

export class GetTeacherAssignmentByIdUseCase {
  constructor({ teacherAssignmentRepository, logger }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {{ snakeCase?: boolean }} [options]
   */
  async execute(id, options = {}) {
    const assignmentId = Number(id);
    if (!Number.isFinite(assignmentId) || assignmentId < 1) {
      throw new NotFoundError('Asignación docente');
    }

    const row = await this.teacherAssignmentRepository.findEnrichedById(assignmentId);
    if (!row) {
      throw new NotFoundError('Asignación docente');
    }

    this.logger.info('[AsignacionesDocentes] Detalle', { assignmentId });

    const asignacion = options.snakeCase
      ? TeacherAssignmentPresentationMapper.enrichedRowToPresentation(row)
      : TeacherAssignmentPresentationMapper.enrichedRowToLegacyPresentation(row);

    return { asignacion };
  }
}
