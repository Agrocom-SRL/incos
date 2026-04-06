import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Permission
 * Representa un permiso del sistema (RBAC).
 * Contiene la lógica de negocio pura del permiso.
 *
 * Mapeo con BD (tabla permisos, 04-sistema-seguridad.sql):
 * - code ← codigo
 * - name ← nombre
 * - description ← descripcion
 * - domain ← dominio
 * - module ← modulo
 */
export class Permission extends BaseEntity {
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
    if (data.hasOwnProperty('description')) {
      this.description = data.description;
    }
    if (data.hasOwnProperty('domain')) {
      this.domain = data.domain;
    }
    if (data.hasOwnProperty('module')) {
      this.module = data.module;
    }
  }

  /**
   * Indica si tiene código definido (requerido a nivel de negocio)
   * @returns {boolean}
   */
  hasCode() {
    return Boolean(this.code && String(this.code).trim() !== '');
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (this.hasOwnProperty('code')) {
      plainObject.code = this.code;
    }
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('description')) {
      plainObject.description = this.description;
    }
    if (this.hasOwnProperty('domain')) {
      plainObject.domain = this.domain;
    }
    if (this.hasOwnProperty('module')) {
      plainObject.module = this.module;
    }

    return plainObject;
  }

  /**
   * Convierte la entidad a JSON
   * @returns {Object}
   */
  toJSON() {
    return this.toPlainObject();
  }
}
