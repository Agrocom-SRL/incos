/**
 * DELETE /api/v1/docentes/asignaciones/:id — baja lógica de asignación docente.
 */

import { NotFoundError } from '../../../domain/errors/index.js';

export class DeleteTeacherAssignmentUseCase {
  /**
 * @param {Object} deps
 * @param {import('../../../infrastructure/repositories/TeacherAssignmentRepository.js').TeacherAssignmentRepository} deps.teacherAssignmentRepository
 * @param {import('./SyncMatriculasTeacherAssignmentUseCase.js').SyncMatriculasTeacherAssignmentUseCase} deps.syncMatriculasTeacherAssignmentUseCase
 * @param {Object} deps.logger
   */
  constructor({ teacherAssignmentRepository, syncMatriculasTeacherAssignmentUseCase, logger }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.syncMatriculasTeacherAssignmentUseCase = syncMatriculasTeacherAssignmentUseCase;
    this.logger = logger;
  }

  /**
   * @param {number} assignmentId
   * @param {number|null} userId
   * @returns {Promise<void>}
   */
  async execute(assignmentId, userId = null) {
    const id = Number(assignmentId);
    if (!Number.isFinite(id) || id < 1) {
      throw new NotFoundError('Asignación docente');
    }

    const existing = await this.teacherAssignmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Asignación docente');
    }

    await this.syncMatriculasTeacherAssignmentUseCase.clearBeforeAssignmentDelete({
      teacherAssignmentId: id,
      userId,
    });

    const deleted = await this.teacherAssignmentRepository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError('Asignación docente');
    }

    this.logger.info('[Docentes] Asignación docente eliminada (soft delete)', {
      assignmentId: id,
      userId,
    });
  }
}

