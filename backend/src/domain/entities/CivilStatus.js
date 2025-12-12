import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: CivilStatus
 * Representa un estado civil
 */
export class CivilStatus extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.name = data.name || null;
    this.abbreviation = data.abbreviation || null;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      name: this.name,
      abbreviation: this.abbreviation,
    };
  }
}
