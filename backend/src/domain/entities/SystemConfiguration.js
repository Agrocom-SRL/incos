import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: SystemConfiguration
 * Representa una configuración del sistema
 */
export class SystemConfiguration extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.key = data.key || null;
    this.value = data.value || null;
    this.type = data.type || 'STRING'; // STRING, NUMBER, BOOLEAN, JSON, DATE
    this.description = data.description || null;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      key: this.key,
      value: this.value,
      type: this.type,
      description: this.description,
    };
  }
}

