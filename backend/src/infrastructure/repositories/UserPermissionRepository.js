import { UsuarioPermiso as UsuarioPermisoModel } from '../database/models/usuario_permiso.js';
import { sequelize } from '../database/sequelize.js';
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

  mapDataToModel(data, _userId = null) {
    return UserPermissionMapper.toModel(data);
  }

  mapDataToUpdate(data, _userId = null) {
    return UserPermissionMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'userPermissions';
  }

  /**
   * Overrides activos del usuario con código de permiso.
   */
  async findOverridesRawByUsuarioId(usuarioId) {
    return sequelize.query(
      `
      SELECT
        id, accion, tipo, motivo,
        permiso_id, codigo, nombre, dominio
      FROM vista_usuarios_permisos_overrides_activos
      WHERE usuario_id = :usuarioId
      ORDER BY codigo, accion
      `,
      { replacements: { usuarioId }, type: sequelize.QueryTypes.SELECT }
    );
  }

  async existsActiveDuplicate(usuarioId, permisoId, accion, tipo) {
    const rows = await sequelize.query(
      `
      SELECT id FROM vista_usuarios_permisos_overrides_activos
      WHERE usuario_id = :usuarioId
        AND permiso_id = :permisoId
        AND accion = :accion
        AND tipo = :tipo
      LIMIT 1
      `,
      {
        replacements: { usuarioId, permisoId, accion, tipo },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return rows.length > 0;
  }

  /**
   * Soft delete de un override si pertenece al usuario.
   * @returns {number} filas afectadas
   */
  async softDeleteOverrideForUser(overrideId, usuarioId) {
    const Model = this.getModel();
    const [affected] = await Model.update(
      {
        activo: false,
        deletedAt: new Date(),
      },
      {
        where: {
          id: overrideId,
          usuarioId,
          activo: true,
        },
      }
    );
    return affected;
  }
}
