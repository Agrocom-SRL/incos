import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Province
 * Representa una provincia (dentro de un departamento)
 */
export class Province extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.departmentId = data.departmentId || null;
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
      departmentId: this.departmentId,
      name: this.name,
      code: this.code,
    };
  }
}
