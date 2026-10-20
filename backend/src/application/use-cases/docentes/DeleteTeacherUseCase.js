/**
 * DELETE /api/v1/docentes/:id — baja lógica de docente y sus asignaciones.
 */

import { NotFoundError } from '../../../domain/errors/index.js';

export class DeleteTeacherUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/TeacherRepository.js').TeacherRepository} deps.teacherRepository
   * @param {import('../../../infrastructure/repositories/TeacherAssignmentRepository.js').TeacherAssignmentRepository} deps.teacherAssignmentRepository
   * @param {Object} deps.logger
   */
  constructor({ teacherRepository, teacherAssignmentRepository, logger }) {
    this.teacherRepository = teacherRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.logger = logger;
  }

  /**
   * @param {number} teacherId
   * @param {number|null} userId
   * @returns {Promise<void>}
   */
  async execute(teacherId, userId = null) {
    const id = Number(teacherId);
    if (!Number.isFinite(id) || id < 1) {
      throw new NotFoundError('Docente');
    }

    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) {
      throw new NotFoundError('Docente');
    }

    // Eliminar (soft delete) todas las asignaciones vigentes/no vigentes del docente.
    const asignacionesResult = await this.teacherAssignmentRepository.findAll(
      { teacherId: id, includeInactive: true },
      1,
      10000
    );
    const asignaciones = asignacionesResult?.teacherAssignments ?? [];
    for (const a of asignaciones) {
      if (a?.id != null) {
        await this.teacherAssignmentRepository.delete(Number(a.id), userId);
      }
    }

    const deleted = await this.teacherRepository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError('Docente');
    }

    this.logger.info('[Docentes] Docente eliminado (soft delete) con asignaciones', {
      teacherId: id,
      assignmentsDeleted: asignaciones.length,
      userId,
    });
  }
}
