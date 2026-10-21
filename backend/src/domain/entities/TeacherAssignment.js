import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: TeacherAssignment
 * Representa la asignación de un docente a un curso por plan habilitado
 * Vincula curso + plan_habilitado + docente
 */
export class TeacherAssignment extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'managementPlanId')) {
      this.managementPlanId = data.managementPlanId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'offerCourseId')) {
      this.offerCourseId = data.offerCourseId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'courseId')) {
      this.courseId = data.courseId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'teacherId')) {
      this.teacherId = data.teacherId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'hours')) {
      this.hours = data.hours;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'active')) {
      this.active = data.active;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'reason')) {
      this.reason = data.reason;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'assignmentDate')) {
      this.assignmentDate = data.assignmentDate;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'managementPlanId')) {
      plainObject.managementPlanId = this.managementPlanId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'offerCourseId')) {
      plainObject.offerCourseId = this.offerCourseId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'courseId')) {
      plainObject.courseId = this.courseId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'teacherId')) {
      plainObject.teacherId = this.teacherId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'hours')) {
      plainObject.hours = this.hours;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'active')) {
      plainObject.active = this.active;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'reason')) {
      plainObject.reason = this.reason;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'assignmentDate')) {
      plainObject.assignmentDate = this.assignmentDate;
    }

    return plainObject;
  }

  /**
   * Convierte la entidad a JSON
   * Usa toPlainObject() para serialización
   * @returns {Object}
   */
  toJSON() {
    return this.toPlainObject();
  }
}
