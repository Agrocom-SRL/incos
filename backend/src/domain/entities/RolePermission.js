import { BaseEntity } from './BaseEntity.js';
import { ACCIONES_PERMISOS_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: RolePermission
 * Representa la relación entre un rol y un permiso con acción concreta.
 * Contiene la lógica de negocio pura de la asignación rol–permiso.
 *
 * Mapeo con BD (tabla roles_permisos, 04-sistema-seguridad.sql):
 * - roleId ← rol_id, permissionId ← permiso_id, action ← accion
 */
export class RolePermission extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('roleId')) {
      this.roleId = data.roleId;
    }
    if (data.hasOwnProperty('permissionId')) {
      this.permissionId = data.permissionId;
    }
    if (data.hasOwnProperty('action')) {
      this.action = data.action; // VER, CREAR, EDITAR, ELIMINAR, APROBAR, EXPORTAR
    }
  }

  /**
   * Valida la acción del permiso
   * @returns {boolean}
   */
  isValidAction() {
    if (!this.action) return false;
    return ACCIONES_PERMISOS_VALUES.includes(this.action);
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('roleId')) {
      plainObject.roleId = this.roleId;
    }
    if (this.hasOwnProperty('permissionId')) {
      plainObject.permissionId = this.permissionId;
    }
    if (this.hasOwnProperty('action')) {
      plainObject.action = this.action;
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
