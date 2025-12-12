import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Permission
 * Representa un permiso del sistema
 */
export class Permission extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.code = data.code || null;
    this.module = data.module || null;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      code: this.code,
      module: this.module,
    };
  }
}
