import { IUsuarioPermisoRepository } from '../../domain/interfaces/repositories/IUsuarioPermisoRepository.js';
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

  mapDataToModel(data, userId = null) {
    return UserPermissionMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
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
        up.id, up.accion, up.tipo, up.motivo,
        p.id AS permiso_id, p.codigo, p.nombre, p.dominio
      FROM usuarios_permisos up
      INNER JOIN permisos p ON p.id = up.permiso_id
        AND p.activo = TRUE AND p.deleted_at IS NULL
      WHERE up.usuario_id = :usuarioId
        AND up.activo = TRUE AND up.deleted_at IS NULL
      ORDER BY p.codigo, up.accion
      `,
      { replacements: { usuarioId }, type: sequelize.QueryTypes.SELECT }
    );
  }

  async existsActiveDuplicate(usuarioId, permisoId, accion, tipo) {
    const rows = await sequelize.query(
      `
      SELECT id FROM usuarios_permisos
      WHERE usuario_id = :usuarioId
        AND permiso_id = :permisoId
        AND accion = :accion
        AND tipo = :tipo
        AND activo = TRUE
        AND deleted_at IS NULL
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
