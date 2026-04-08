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
    if (data.hasOwnProperty('code')) {
      this.code = data.code;
    }
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('tipo')) {
      this.tipo = data.tipo;
    }
    if (data.hasOwnProperty('isSystem')) {
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
    if (this.hasOwnProperty('code')) {
      plainObject.code = this.code;
    }
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('tipo')) {
      plainObject.tipo = this.tipo;
    }
    if (this.hasOwnProperty('isSystem')) {
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
