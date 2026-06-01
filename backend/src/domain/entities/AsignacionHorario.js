import { BaseEntity } from './BaseEntity.js';

/**
 * Bloque horario de una asignación docente (tabla asignacion_horarios).
 */
export class AsignacionHorario extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (data.hasOwnProperty('teacherAssignmentId')) {
      this.teacherAssignmentId = data.teacherAssignmentId;
    }
    if (data.hasOwnProperty('scheduleId')) {
      this.scheduleId = data.scheduleId;
    }
    if (data.hasOwnProperty('classroomId')) {
      this.classroomId = data.classroomId;
    }
    if (data.hasOwnProperty('sequenceOrder')) {
      this.sequenceOrder = data.sequenceOrder;
    } else if (!data.hasOwnProperty('teacherAssignmentId')) {
      this.sequenceOrder = 1;
    }
  }

  isValidSequenceOrder() {
    return this.sequenceOrder > 0;
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();
    if (this.hasOwnProperty('teacherAssignmentId')) {
      plainObject.teacherAssignmentId = this.teacherAssignmentId;
    }
    if (this.hasOwnProperty('scheduleId')) {
      plainObject.scheduleId = this.scheduleId;
    }
    if (this.hasOwnProperty('classroomId')) {
      plainObject.classroomId = this.classroomId;
    }
    if (this.hasOwnProperty('sequenceOrder')) {
      plainObject.sequenceOrder = this.sequenceOrder;
    }
    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
