import { BaseEntity } from './BaseEntity.js';

/**
 * Bloque horario de una asignación docente (tabla asignacion_horarios).
 */
export class AsignacionHorario extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (Object.prototype.hasOwnProperty.call(data, 'teacherAssignmentId')) {
      this.teacherAssignmentId = data.teacherAssignmentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'scheduleId')) {
      this.scheduleId = data.scheduleId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'classroomId')) {
      this.classroomId = data.classroomId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'sequenceOrder')) {
      this.sequenceOrder = data.sequenceOrder;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'teacherAssignmentId')) {
      this.sequenceOrder = 1;
    }
  }

  isValidSequenceOrder() {
    return this.sequenceOrder > 0;
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();
    if (Object.prototype.hasOwnProperty.call(this, 'teacherAssignmentId')) {
      plainObject.teacherAssignmentId = this.teacherAssignmentId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'scheduleId')) {
      plainObject.scheduleId = this.scheduleId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'classroomId')) {
      plainObject.classroomId = this.classroomId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'sequenceOrder')) {
      plainObject.sequenceOrder = this.sequenceOrder;
    }
    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
