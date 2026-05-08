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

      const hasConflict = await this.courseScheduleRepository.hasClassroomConflict({
        scheduleId: schedule.scheduleId,
        classroomId: nextAulaId,
        excludeCourseScheduleId: id,
      });
      if (hasConflict) {
        throw new ValidationError('La aula ya está asignada en ese mismo bloque horario');
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

