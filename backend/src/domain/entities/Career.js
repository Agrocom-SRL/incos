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
    this.trainingArea = data.trainingArea || null;
    this.grantedTitle = data.grantedTitle || null;
    this.colorHex = data.colorHex || null;
    this.imagePath = data.imagePath || null;
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
      trainingArea: this.trainingArea,
      grantedTitle: this.grantedTitle,
      colorHex: this.colorHex,
      imagePath: this.imagePath,
    };
  }
}
