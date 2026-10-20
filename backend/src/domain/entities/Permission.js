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
 * - uiGroup ← grupo_ui
 * - sidebarRoute ← ruta_sidebar
 */
export class Permission extends BaseEntity {
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
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      this.description = data.description;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'domain')) {
      this.domain = data.domain;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'module')) {
      this.module = data.module;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'uiGroup')) {
      this.uiGroup = data.uiGroup;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'sidebarRoute')) {
      this.sidebarRoute = data.sidebarRoute;
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

    if (Object.prototype.hasOwnProperty.call(this, 'code')) {
      plainObject.code = this.code;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'description')) {
      plainObject.description = this.description;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'domain')) {
      plainObject.domain = this.domain;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'module')) {
      plainObject.module = this.module;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'uiGroup')) {
      plainObject.uiGroup = this.uiGroup;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'sidebarRoute')) {
      plainObject.sidebarRoute = this.sidebarRoute;
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
