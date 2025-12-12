import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Shift
 * Representa un turno horario (Mañana, Tarde, Noche)
 */
export class Shift extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.name = data.name || null;
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.description = data.description || null;
    this.colorHex = data.colorHex || null;
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      description: this.description,
      colorHex: this.colorHex,
    };
  }
}
