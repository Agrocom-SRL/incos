import { BaseEntity } from './BaseEntity.js';
import { TURNOS_VALUES } from '../constants/cursos.constants.js';

/**
 * Entidad de Dominio: Parallel
 * Representa grupos multi-materia por carrera y periodo
 * Estructura estable de grupos vinculados a un periodo del plan de estudios
 */
export class Parallel extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'careerId')) {
      this.careerId = data.careerId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'periodId')) {
      this.periodId = data.periodId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'shift')) {
      this.shift = data.shift;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      this.description = data.description;
    }
  }

  /**
   * Valida el turno
   * @returns {boolean}
   */
  isValidShift() {
    if (!this.shift) return false;
    return TURNOS_VALUES.includes(this.shift);
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'careerId')) {
      plainObject.careerId = this.careerId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'periodId')) {
      plainObject.periodId = this.periodId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'shift')) {
      plainObject.shift = this.shift;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'description')) {
      plainObject.description = this.description;
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
