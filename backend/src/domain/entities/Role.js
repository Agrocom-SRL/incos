import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Role
 * Representa un rol del sistema
 */
export class Role extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.code = data.code || null;
    this.name = data.name || null;
    this.accessLevel = data.accessLevel !== undefined ? data.accessLevel : 1;
  }

  /**
   * Valida que el nivel de acceso esté en el rango válido (1-5)
   * @returns {boolean}
   */
  isValidAccessLevel() {
    return this.accessLevel >= 1 && this.accessLevel <= 5;
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
      accessLevel: this.accessLevel,
    };
  }
}
