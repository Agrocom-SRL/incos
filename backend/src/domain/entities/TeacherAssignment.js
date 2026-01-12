import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: TeacherAssignment
 * Representa la asignación de un docente a un curso por plan habilitado
 * Vincula curso + plan_habilitado + docente
 */
export class TeacherAssignment extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.managementPlanId = data.managementPlanId || null;
    this.courseId = data.courseId || null;
    this.teacherId = data.teacherId || null;
    this.hours = data.hours || null;
    this.active = data.active !== undefined ? data.active : true;
    this.reason = data.reason || null;
    this.assignmentDate = data.assignmentDate || null;
  }

  /**
   * Verifica si la asignación está vigente
   * @returns {boolean}
   */
  isActive() {
    return this.active === true;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      managementPlanId: this.managementPlanId,
      courseId: this.courseId,
      teacherId: this.teacherId,
      hours: this.hours,
      active: this.active,
      reason: this.reason,
      assignmentDate: this.assignmentDate,
    };
  }
}
