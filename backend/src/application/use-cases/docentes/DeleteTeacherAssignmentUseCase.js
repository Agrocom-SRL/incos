/**
 * DELETE — baja lógica de asignación docente.
 * Matrículas permanecen en oferta_curso_id; no se repuntan ni desvinculan.
 */

import { NotFoundError } from '../../../domain/errors/index.js';

export class DeleteTeacherAssignmentUseCase {
  constructor({ teacherAssignmentRepository, logger }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.logger = logger;
  }

  async execute(assignmentId, userId = null) {
    const id = Number(assignmentId);
    if (!Number.isFinite(id) || id < 1) {
      throw new NotFoundError('Asignación docente');
    }

    const existing = await this.teacherAssignmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Asignación docente');
    }

    const deleted = await this.teacherAssignmentRepository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError('Asignación docente');
    }

    this.logger.info('[AsignacionesDocentes] Asignación eliminada (soft delete)', {
      assignmentId: id,
      userId,
    });
  }
}
