import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: CourseSchedule
 * Representa los horarios de cada curso
 * Define qué bloques horarios y aulas utiliza cada curso
 */
export class CourseSchedule extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('courseId')) {
      this.courseId = data.courseId;
    }
    if (data.hasOwnProperty('scheduleId')) {
      this.scheduleId = data.scheduleId;
    }
    if (data.hasOwnProperty('classroomId')) {
      this.classroomId = data.classroomId;
    }
    if (data.hasOwnProperty('sequenceOrder')) {
      this.sequenceOrder = data.sequenceOrder;
    } else if (!data.hasOwnProperty('courseId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.sequenceOrder = 1;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('courseId')) {
      plainObject.courseId = this.courseId;
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

  /**
   * Convierte la entidad a JSON
   * Usa toPlainObject() para serialización
   * @returns {Object}
   */
  toJSON() {
    return this.toPlainObject();
  }
}
