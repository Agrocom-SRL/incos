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
    if (data.hasOwnProperty('managementPlanId')) {
      this.managementPlanId = data.managementPlanId;
    }
    if (data.hasOwnProperty('offerCourseId')) {
      this.offerCourseId = data.offerCourseId;
    }
    if (data.hasOwnProperty('courseId')) {
      this.courseId = data.courseId;
    }
    if (data.hasOwnProperty('teacherId')) {
      this.teacherId = data.teacherId;
    }
    if (data.hasOwnProperty('hours')) {
      this.hours = data.hours;
    }
    if (data.hasOwnProperty('active')) {
      this.active = data.active;
    }
    if (data.hasOwnProperty('reason')) {
      this.reason = data.reason;
    }
    if (data.hasOwnProperty('assignmentDate')) {
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
    if (this.hasOwnProperty('managementPlanId')) {
      plainObject.managementPlanId = this.managementPlanId;
    }
    if (this.hasOwnProperty('offerCourseId')) {
      plainObject.offerCourseId = this.offerCourseId;
    }
    if (this.hasOwnProperty('courseId')) {
      plainObject.courseId = this.courseId;
    }
    if (this.hasOwnProperty('teacherId')) {
      plainObject.teacherId = this.teacherId;
    }
    if (this.hasOwnProperty('hours')) {
      plainObject.hours = this.hours;
    }
    if (this.hasOwnProperty('active')) {
      plainObject.active = this.active;
    }
    if (this.hasOwnProperty('reason')) {
      plainObject.reason = this.reason;
    }
    if (this.hasOwnProperty('assignmentDate')) {
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
