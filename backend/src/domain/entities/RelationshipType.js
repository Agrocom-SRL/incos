import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: RelationshipType
 * Representa un tipo de parentesco
 */
export class RelationshipType extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.name = data.name || null;
    this.description = data.description || null;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      name: this.name,
      description: this.description,
    };
  }
}
