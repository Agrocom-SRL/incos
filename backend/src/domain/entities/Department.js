import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Department
 * Representa un departamento (dentro de un país)
 */
export class Department extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.countryId = data.countryId || null;
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
      countryId: this.countryId,
      name: this.name,
      code: this.code,
    };
  }
}
