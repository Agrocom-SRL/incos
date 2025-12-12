import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Country
 * Representa un país
 */
export class Country extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.name = data.name || null;
    this.isoCode = data.isoCode || null;
  }

  /**
   * Valida que el código ISO tenga 3 caracteres
   * @returns {boolean}
   */
  isValidIsoCode() {
    if (!this.isoCode) return false;
    return this.isoCode.length === 3 && /^[A-Z]{3}$/.test(this.isoCode);
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      name: this.name,
      isoCode: this.isoCode,
    };
  }
}
