import { NotFoundError, ValidationError } from '../../../domain/errors/index.js';

export class PatchAulaHorarioUseCase {
  constructor({ courseScheduleRepository, classroomRepository, logger }) {
    this.courseScheduleRepository = courseScheduleRepository;
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  async execute(courseScheduleId, aulaId, userId = null) {
    const id = Number(courseScheduleId);
    if (!Number.isFinite(id) || id < 1) {
      throw new ValidationError('cursoHorarioId inválido');
    }

    const schedule = await this.courseScheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError('Bloque de curso horario');
    }

    const nextAulaId = aulaId == null ? null : Number(aulaId);
    if (nextAulaId != null && (!Number.isFinite(nextAulaId) || nextAulaId < 1)) {
      throw new ValidationError('aulaId debe ser número positivo o null');
    }

    if (nextAulaId != null) {
      const aula = await this.classroomRepository.findById(nextAulaId);
      if (!aula) throw new NotFoundError('Aula');

      const conflictCourseScheduleId = await this.courseScheduleRepository.findClassroomConflict({
        scheduleId: schedule.scheduleId,
        classroomId: nextAulaId,
        excludeCourseScheduleId: id,
      });

      if (Number.isFinite(conflictCourseScheduleId) && conflictCourseScheduleId > 0) {
        this.logger?.warn('Conflicto de aula resuelto por reasignación automática', {
          scheduleId: schedule.scheduleId,
          classroomId: nextAulaId,
          requestedCourseScheduleId: id,
          previousCourseScheduleId: conflictCourseScheduleId,
        });

        // Regla de negocio: el bloque editado por el usuario queda como oficial
        // y el bloque previo en conflicto se desasigna.
        await this.courseScheduleRepository.update(conflictCourseScheduleId, { classroomId: null }, userId);
      }
    }

    const updated = await this.courseScheduleRepository.update(id, { classroomId: nextAulaId }, userId);
    return {
      id: updated.id,
      courseId: updated.courseId,
      scheduleId: updated.scheduleId,
      classroomId: updated.classroomId ?? null,
      sequenceOrder: updated.sequenceOrder,
    };
  }
}

