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
    if (Object.prototype.hasOwnProperty.call(data, 'userId')) {
      this.userId = data.userId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'permissionId')) {
      this.permissionId = data.permissionId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'action')) {
      this.action = data.action;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'overrideType')) {
      this.overrideType = data.overrideType;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'reason')) {
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
    if (Object.prototype.hasOwnProperty.call(this, 'userId')) plainObject.userId = this.userId;
    if (Object.prototype.hasOwnProperty.call(this, 'permissionId')) plainObject.permissionId = this.permissionId;
    if (Object.prototype.hasOwnProperty.call(this, 'action')) plainObject.action = this.action;
    if (Object.prototype.hasOwnProperty.call(this, 'overrideType')) plainObject.overrideType = this.overrideType;
    if (Object.prototype.hasOwnProperty.call(this, 'reason')) plainObject.reason = this.reason;
    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
