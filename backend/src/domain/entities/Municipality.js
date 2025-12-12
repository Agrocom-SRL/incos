import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Municipality
 * Representa un municipio (dentro de una provincia)
 */
export class Municipality extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.provinceId = data.provinceId || null;
    this.name = data.name || null;
    this.code = data.code || null;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      provinceId: this.provinceId,
      name: this.name,
      code: this.code,
    };
  }
}
