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
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'day')) {
      this.day = data.day;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'startTime')) {
      this.startTime = data.startTime;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'endTime')) {
      this.endTime = data.endTime;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'shift')) {
      this.shift = data.shift;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'blockNumber')) {
      this.blockNumber = data.blockNumber;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'scheduleType')) {
      this.scheduleType = data.scheduleType;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.scheduleType = TIPOS_HORARIO.CLASES;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'day')) {
      plainObject.day = this.day;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'startTime')) {
      plainObject.startTime = this.startTime;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'endTime')) {
      plainObject.endTime = this.endTime;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'shift')) {
      plainObject.shift = this.shift;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'blockNumber')) {
      plainObject.blockNumber = this.blockNumber;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'scheduleType')) {
      plainObject.scheduleType = this.scheduleType;
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
