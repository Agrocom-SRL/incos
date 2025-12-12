import { BaseEntity } from './BaseEntity.js';
import { ACCIONES_PERMISOS_VALUES } from '../../shared/constants/index.js';

/**
 * Entidad de Dominio: RolePermission
 * Representa la relación entre un rol y un permiso
 */
export class RolePermission extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.roleId = data.roleId || null;
    this.permissionId = data.permissionId || null;
    this.action = data.action || null; // VER, CREAR, EDITAR, ELIMINAR, APROBAR, EXPORTAR
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      roleId: this.roleId,
      permissionId: this.permissionId,
      action: this.action,
    };
  }
}
