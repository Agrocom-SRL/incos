import { BaseEntity } from './BaseEntity.js';
import { DIAS_SEMANA_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: CourseShift
 * Representa el horario de un curso en un día específico
 */
export class CourseShift extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('assignmentId')) {
      this.assignmentId = data.assignmentId;
    }
    if (data.hasOwnProperty('shiftId')) {
      this.shiftId = data.shiftId;
    }
    if (data.hasOwnProperty('weekDay')) {
      this.weekDay = data.weekDay; // LUNES, MARTES, MIERCOLES, etc.
    }
    if (data.hasOwnProperty('startTime')) {
      this.startTime = data.startTime;
    }
    if (data.hasOwnProperty('endTime')) {
      this.endTime = data.endTime;
    }
    if (data.hasOwnProperty('classroom')) {
      this.classroom = data.classroom;
    }
  }

  /**
   * Valida el día de la semana
   * @returns {boolean}
   */
  isValidWeekDay() {
    if (!this.weekDay) return false;
    return DIAS_SEMANA_VALUES.includes(this.weekDay);
  }

  /**
   * Valida que la hora de fin sea mayor que la de inicio
   * @returns {boolean}
   */
  isValidTimeRange() {
    if (!this.startTime || !this.endTime) return false;
    return this.endTime > this.startTime;
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('assignmentId')) {
      plainObject.assignmentId = this.assignmentId;
    }
    if (this.hasOwnProperty('shiftId')) {
      plainObject.shiftId = this.shiftId;
    }
    if (this.hasOwnProperty('weekDay')) {
      plainObject.weekDay = this.weekDay;
    }
    if (this.hasOwnProperty('startTime')) {
      plainObject.startTime = this.startTime;
    }
    if (this.hasOwnProperty('endTime')) {
      plainObject.endTime = this.endTime;
    }
    if (this.hasOwnProperty('classroom')) {
      plainObject.classroom = this.classroom;
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
