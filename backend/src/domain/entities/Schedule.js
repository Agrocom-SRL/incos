import { BaseEntity } from './BaseEntity.js';
import { DIAS_SEMANA_VALUES, TURNOS_VALUES, TIPOS_HORARIO_VALUES, TIPOS_HORARIO } from '../constants/cursos.constants.js';

/**
 * Entidad de Dominio: Schedule
 * Representa bloques horarios conceptuales
 * Soporta clases (45 min), eventos (personalizados), feriados (día completo) y capacitaciones
 */
export class Schedule extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.name = data.name || null;
    this.day = data.day || null;
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.shift = data.shift || null;
    this.blockNumber = data.blockNumber || null;
    this.scheduleType = data.scheduleType || TIPOS_HORARIO.CLASES;
  }

  /**
   * Valida el día de la semana
   * @returns {boolean}
   */
  isValidDay() {
    if (this.day === null) return true; // NULL es válido
    return DIAS_SEMANA_VALUES.includes(this.day);
  }

  /**
   * Valida el turno
   * @returns {boolean}
   */
  isValidShift() {
    if (this.shift === null) return true; // NULL es válido
    return TURNOS_VALUES.includes(this.shift);
  }

  /**
   * Valida el tipo de horario
   * @returns {boolean}
   */
  isValidScheduleType() {
    if (!this.scheduleType) return false;
    return TIPOS_HORARIO_VALUES.includes(this.scheduleType);
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      name: this.name,
      day: this.day,
      startTime: this.startTime,
      endTime: this.endTime,
      shift: this.shift,
      blockNumber: this.blockNumber,
      scheduleType: this.scheduleType,
    };
  }
}
