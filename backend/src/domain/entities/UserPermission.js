import { BaseEntity } from './BaseEntity.js';
import { ACCIONES_PERMISOS_VALUES, TIPOS_USUARIO_PERMISO_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: UserPermission
 * Override de permiso por usuario (GRANT/REVOKE sobre el rol base).
 * Contiene la lógica de negocio pura del override.
 *
 * Mapeo con BD (tabla usuarios_permisos, 04-sistema-seguridad.sql):
 * - userId ← usuario_id, permissionId ← permiso_id, action ← accion
 * - overrideType ← tipo, reason ← motivo
 */
export class UserPermission extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (data.hasOwnProperty('userId')) {
      this.userId = data.userId;
    }
    if (data.hasOwnProperty('permissionId')) {
      this.permissionId = data.permissionId;
    }
    if (data.hasOwnProperty('action')) {
      this.action = data.action;
    }
    if (data.hasOwnProperty('overrideType')) {
      this.overrideType = data.overrideType;
    }
    if (data.hasOwnProperty('reason')) {
      this.reason = data.reason;
    }
  }

  isValidAction() {
    if (!this.action) return false;
    return ACCIONES_PERMISOS_VALUES.includes(this.action);
  }

  isValidOverrideType() {
    if (!this.overrideType) return false;
    return TIPOS_USUARIO_PERMISO_VALUES.includes(this.overrideType);
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();
    if (this.hasOwnProperty('userId')) plainObject.userId = this.userId;
    if (this.hasOwnProperty('permissionId')) plainObject.permissionId = this.permissionId;
    if (this.hasOwnProperty('action')) plainObject.action = this.action;
    if (this.hasOwnProperty('overrideType')) plainObject.overrideType = this.overrideType;
    if (this.hasOwnProperty('reason')) plainObject.reason = this.reason;
    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
