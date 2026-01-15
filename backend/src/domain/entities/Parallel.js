import { BaseEntity } from './BaseEntity.js';
import { TURNOS_VALUES, TURNOS } from '../constants/cursos.constants.js';

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
    if (data.hasOwnProperty('careerId')) {
      this.careerId = data.careerId;
    }
    if (data.hasOwnProperty('periodId')) {
      this.periodId = data.periodId;
    }
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('shift')) {
      this.shift = data.shift;
    }
    if (data.hasOwnProperty('description')) {
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
    if (this.hasOwnProperty('careerId')) {
      plainObject.careerId = this.careerId;
    }
    if (this.hasOwnProperty('periodId')) {
      plainObject.periodId = this.periodId;
    }
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('shift')) {
      plainObject.shift = this.shift;
    }
    if (this.hasOwnProperty('description')) {
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
