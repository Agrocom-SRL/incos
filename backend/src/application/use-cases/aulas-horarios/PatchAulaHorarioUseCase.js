import { NotFoundError, ValidationError } from '../../../domain/errors/index.js';

export class PatchAulaHorarioUseCase {
  constructor({ asignacionHorarioRepository, classroomRepository, logger }) {
    this.asignacionHorarioRepository = asignacionHorarioRepository;
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  async execute(asignacionHorarioId, aulaId, userId = null) {
    const id = Number(asignacionHorarioId);
    if (!Number.isFinite(id) || id < 1) {
      throw new ValidationError('cursoHorarioId inválido');
    }

    const schedule = await this.asignacionHorarioRepository.findById(id);
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

      const conflictBloqueId = await this.asignacionHorarioRepository.findClassroomConflict({
        scheduleId: schedule.scheduleId,
        classroomId: nextAulaId,
        excludeAsignacionHorarioId: id,
      });

      if (Number.isFinite(conflictBloqueId) && conflictBloqueId > 0) {
        this.logger?.warn('Conflicto de aula resuelto por reasignación automática', {
          scheduleId: schedule.scheduleId,
          classroomId: nextAulaId,
          requestedAsignacionHorarioId: id,
          previousAsignacionHorarioId: conflictBloqueId,
        });

        await this.asignacionHorarioRepository.update(conflictBloqueId, { classroomId: null }, userId);
      }
    }

    const updated = await this.asignacionHorarioRepository.update(id, { classroomId: nextAulaId }, userId);
    return {
      id: updated.id,
      teacherAssignmentId: updated.teacherAssignmentId,
      scheduleId: updated.scheduleId,
      classroomId: updated.classroomId ?? null,
      sequenceOrder: updated.sequenceOrder,
    };
  }
}

