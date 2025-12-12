import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Language
 * Representa un idioma
 */
export class Language extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.name = data.name || null;
    this.isoCode = data.isoCode || null;
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
