import { IUsuarioPermisoRepository } from '../../domain/interfaces/repositories/IUsuarioPermisoRepository.js';
import { UsuarioPermiso as UsuarioPermisoModel } from '../database/models/usuario_permiso.js';
import { BaseRepository } from './BaseRepository.js';
import { UserPermissionMapper } from '../mappers/UserPermissionMapper.js';

/**
 * @implements {IUsuarioPermisoRepository}
 */
export class UserPermissionRepository extends BaseRepository {
  getModel() {
    return UsuarioPermisoModel;
  }

  toEntity(model) {
    return UserPermissionMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.userId) {
      where.usuarioId = filters.userId;
    }
    if (filters.permissionId) {
      where.permisoId = filters.permissionId;
    }
    if (filters.action) {
      where.accion = filters.action;
    }
    if (filters.overrideType) {
      where.tipo = filters.overrideType;
    }
    return where;
  }

  getSearchFields() {
    return [];
  }

  getDefaultSort() {
    return [];
  }

  mapDataToModel(data, userId = null) {
    return UserPermissionMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return UserPermissionMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'userPermissions';
  }
}
