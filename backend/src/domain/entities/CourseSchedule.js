import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: CourseSchedule
 * Representa los horarios de cada curso
 * Define qué bloques horarios y aulas utiliza cada curso
 */
export class CourseSchedule extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.courseId = data.courseId || null;
    this.scheduleId = data.scheduleId || null;
    this.classroomId = data.classroomId || null;
    this.sequenceOrder = data.sequenceOrder !== undefined ? data.sequenceOrder : 1;
  }

  /**
   * Valida que el orden de secuencia sea positivo
   * @returns {boolean}
   */
  isValidSequenceOrder() {
    return this.sequenceOrder > 0;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      courseId: this.courseId,
      scheduleId: this.scheduleId,
      classroomId: this.classroomId,
      sequenceOrder: this.sequenceOrder,
    };
  }
}
