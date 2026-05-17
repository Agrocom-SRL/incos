/**
 * Orquesta la sincronización entre asignaciones_docentes y matriculas_materia
 * tras alta o baja de una asignación docente (sin mezclar repositorios entre tablas).
 */

import { SubjectEnrollment } from '../../../domain/entities/SubjectEnrollment.js';

export class SyncMatriculasTeacherAssignmentUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/TeacherAssignmentRepository.js').TeacherAssignmentRepository} deps.teacherAssignmentRepository
   * @param {import('../../../infrastructure/repositories/SubjectEnrollmentRepository.js').SubjectEnrollmentRepository} deps.subjectEnrollmentRepository
   * @param {Object} deps.logger
   */
  constructor({ teacherAssignmentRepository, subjectEnrollmentRepository, logger }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.logger = logger;
  }

  /**
   * @param {{ id?: number, active?: boolean, deletedAt?: Date|string|null }} assignment
   * @param {number} excludeAssignmentId
   * @returns {boolean}
   */
  _isSupersededTeacherAssignment(assignment, excludeAssignmentId) {
    if (!assignment?.id || Number(assignment.id) === Number(excludeAssignmentId)) {
      return false;
    }
    if (assignment.deletedAt != null) return true;
    return assignment.active === false;
  }

  /**
   * Tras crear una asignación vigente nueva, repunta matrículas activas que aún apuntan
   * a otras asignaciones del mismo curso y plan habilitado.
   *
   * @param {{ managementPlanId: number, courseId: number, newTeacherAssignmentId: number, userId?: number|null }} params
   * @returns {Promise<number>}
   */
  async repointAfterAssignmentCreated({
    managementPlanId,
    courseId,
    newTeacherAssignmentId,
    userId = null,
  }) {
    const gp = Number(managementPlanId);
    const cId = Number(courseId);
    const newId = Number(newTeacherAssignmentId);
    if (!Number.isFinite(gp) || !Number.isFinite(cId) || !Number.isFinite(newId)) return 0;

    const assignmentResult = await this.teacherAssignmentRepository.findAll({
      managementPlanId: gp,
      courseId: cId,
      includeInactive: true,
      includeDeleted: true,
    });
    const assignments = assignmentResult?.teacherAssignments ?? [];

    const supersededIds = assignments
      .filter((a) => this._isSupersededTeacherAssignment(a, newId))
      .map((a) => a.id)
      .filter((id) => Number.isFinite(Number(id)));

    if (!supersededIds.length) return 0;

    const enrollmentResult = await this.subjectEnrollmentRepository.findAll({
      teacherAssignmentIds: supersededIds,
    });
    const enrollments = enrollmentResult?.subjectEnrollments ?? [];

    let updated = 0;
    for (const row of enrollments) {
      if (!row?.id) continue;
      await this.subjectEnrollmentRepository.update(
        row.id,
        new SubjectEnrollment({ teacherAssignmentId: newId }),
        userId
      );
      updated += 1;
    }

    if (updated > 0) {
      this.logger.info('[Docentes] Matrículas repuntadas a nueva asignación docente', {
        managementPlanId: gp,
        courseId: cId,
        newTeacherAssignmentId: newId,
        updated,
        userId,
      });
    }

    return updated;
  }

  /**
   * Antes de eliminar una asignación docente, desvincula matrículas activas que la referencian.
   *
   * @param {{ teacherAssignmentId: number, userId?: number|null }} params
   * @returns {Promise<number>}
   */
  async clearBeforeAssignmentDelete({ teacherAssignmentId, userId = null }) {
    const aid = Number(teacherAssignmentId);
    if (!Number.isFinite(aid)) return 0;

    const enrollmentResult = await this.subjectEnrollmentRepository.findAll({
      teacherAssignmentId: aid,
      includeInactive: true,
    });
    const enrollments = enrollmentResult?.subjectEnrollments ?? [];

    let updated = 0;
    for (const row of enrollments) {
      if (!row?.id || row.deletedAt != null) continue;
      await this.subjectEnrollmentRepository.update(
        row.id,
        new SubjectEnrollment({ teacherAssignmentId: null }),
        userId
      );
      updated += 1;
    }

    if (updated > 0) {
      this.logger.info('[Docentes] Matrículas desvinculadas antes de baja de asignación docente', {
        teacherAssignmentId: aid,
        updated,
        userId,
      });
    }

    return updated;
  }
}
