import { BaseEntity } from './BaseEntity.js';
import { DIAS_SEMANA_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: CourseShift
 * Representa el horario de un curso en un día específico
 */
export class CourseShift extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.assignmentId = data.assignmentId || null;
    this.shiftId = data.shiftId || null;
    this.weekDay = data.weekDay || null; // LUNES, MARTES, MIERCOLES, etc.
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.classroom = data.classroom || null;
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      assignmentId: this.assignmentId,
      shiftId: this.shiftId,
      weekDay: this.weekDay,
      startTime: this.startTime,
      endTime: this.endTime,
      classroom: this.classroom,
    };
  }
}
