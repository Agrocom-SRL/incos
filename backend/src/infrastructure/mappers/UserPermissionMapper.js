import { UserPermission } from '../../domain/entities/UserPermission.js';
import { BaseMapper } from './BaseMapper.js';

export class UserPermissionMapper {
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('usuarioId' in dataValues && dataValues.usuarioId !== undefined) {
      specificFields.userId = dataValues.usuarioId;
    }
    if ('permisoId' in dataValues && dataValues.permisoId !== undefined) {
      specificFields.permissionId = dataValues.permisoId;
    }
    if ('accion' in dataValues && dataValues.accion !== undefined) {
      specificFields.action = dataValues.accion;
    }
    if ('tipo' in dataValues && dataValues.tipo !== undefined) {
      specificFields.overrideType = dataValues.tipo;
    }
    if ('motivo' in dataValues && dataValues.motivo !== undefined) {
      specificFields.reason = dataValues.motivo;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new UserPermission(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof UserPermission ? entity.toPlainObject() : entity;
    return {
      usuarioId: data.userId,
      permisoId: data.permissionId,
      accion: data.action,
      tipo: data.overrideType,
      motivo: data.reason,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof UserPermission ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('userId' in data) updateData.usuarioId = data.userId;
    if ('permissionId' in data) updateData.permisoId = data.permissionId;
    if ('action' in data) updateData.accion = data.action;
    if ('overrideType' in data) updateData.tipo = data.overrideType;
    if ('reason' in data) updateData.motivo = data.reason;

    Object.assign(updateData, BaseMapper.baseFieldsToModelForUpdate(entity));
    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((m) => this.toEntity(m)).filter((e) => e !== null);
  }
}
