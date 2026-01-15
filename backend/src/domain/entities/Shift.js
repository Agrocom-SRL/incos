import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Shift
 * Representa un turno horario (Mañana, Tarde, Noche)
 */
export class Shift extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('startTime')) {
      this.startTime = data.startTime;
    }
    if (data.hasOwnProperty('endTime')) {
      this.endTime = data.endTime;
    }
    if (data.hasOwnProperty('description')) {
      this.description = data.description;
    }
    if (data.hasOwnProperty('colorHex')) {
      this.colorHex = data.colorHex;
    }
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
   * Valida el formato del color hexadecimal
   * @returns {boolean}
   */
  isValidColorHex() {
    if (!this.colorHex) return true; // Opcional
    return /^#[0-9A-F]{6}$/i.test(this.colorHex);
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('startTime')) {
      plainObject.startTime = this.startTime;
    }
    if (this.hasOwnProperty('endTime')) {
      plainObject.endTime = this.endTime;
    }
    if (this.hasOwnProperty('description')) {
      plainObject.description = this.description;
    }
    if (this.hasOwnProperty('colorHex')) {
      plainObject.colorHex = this.colorHex;
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
