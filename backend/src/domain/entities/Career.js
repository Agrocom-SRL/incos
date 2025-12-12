import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Career
 * Representa una carrera académica
 */
export class Career extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.code = data.code || null;
    this.name = data.name || null;
    this.description = data.description || null;
    this.durationYears = data.durationYears !== undefined ? data.durationYears : 4;
    this.grantedTitle = data.grantedTitle || null;
    this.ministerialResolution = data.ministerialResolution || null;
    this.effectiveDate = data.effectiveDate || null;
    this.totalHours = data.totalHours || null;
    this.colorHex = data.colorHex || null;
  }

  /**
   * Valida que la duración sea positiva
   * @returns {boolean}
   */
  isValidDuration() {
    return this.durationYears > 0;
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
      code: this.code,
      name: this.name,
      description: this.description,
      durationYears: this.durationYears,
      grantedTitle: this.grantedTitle,
      ministerialResolution: this.ministerialResolution,
      effectiveDate: this.effectiveDate,
      totalHours: this.totalHours,
      colorHex: this.colorHex,
    };
  }
}
