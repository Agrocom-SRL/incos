import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Role
 * Representa un rol del sistema.
 * Contiene la lógica de negocio pura del rol.
 *
 * Mapeo con BD (tabla roles, 04-sistema-seguridad.sql):
 * - code ← codigo, name ← nombre, tipo ← tipo, isSystem ← is_system
 */
export class Role extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'code')) {
      this.code = data.code;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'tipo')) {
      this.tipo = data.tipo;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'isSystem')) {
      this.isSystem = data.isSystem;
    }
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'code')) {
      plainObject.code = this.code;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'tipo')) {
      plainObject.tipo = this.tipo;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'isSystem')) {
      plainObject.isSystem = this.isSystem;
    }

    return plainObject;
  }

  /**
   * Convierte la entidad a JSON
   * Usa toPlainObject() para serialización
   * @returns {Object}
   */
  toJSON() {
    return this.toPlainObject();
  }
}
