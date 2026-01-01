import { IRolPermisoRepository } from '../../domain/interfaces/repositories/IRolPermisoRepository.js';
import { RolPermiso as RolPermisoModel } from '../database/models/rol_permiso.js';
import { RolePermission } from '../../domain/entities/RolePermission.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de roles-permisos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IRolPermisoRepository}
 * 
 * Esta clase cumple con el contrato IRolPermisoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByRolId() y findByPermisoId() que son requeridos por IRolPermisoRepository
 */
export class RolePermissionRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de roles-permisos
   * @returns {Object} Modelo RolPermiso
   */
  getModel() {
    return RolPermisoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {RolePermission|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new RolePermission({
      id: model.id,
      roleId: model.rolId,
      permissionId: model.permisoId,
      action: model.accion,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.roleId) {
      where.rolId = filters.roleId;
    }
    if (filters.permissionId) {
      where.permisoId = filters.permissionId;
    }
    if (filters.action) {
      where.accion = filters.action;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['accion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['rolId', 'ASC'], ['permisoId', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      rolId: data.roleId,
      permisoId: data.permissionId,
      accion: data.action,
    };
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

    if (data.roleId !== undefined) {
      updateData.rolId = data.roleId;
    }
    if (data.permissionId !== undefined) {
      updateData.permisoId = data.permissionId;
    }
    if (data.action !== undefined) {
      updateData.accion = data.action;
    }
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }

    return updateData;
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'rolePermissions';
  }

  /**
   * Método específico: Buscar permisos por rol
   * @param {number} rolId
   * @returns {Promise<RolePermission[]>}
   */
  async findByRolId(rolId) {
    const models = await this.getModel().findAll({
      where: {
        rolId: rolId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['permisoId', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar roles por permiso
   * @param {number} permisoId
   * @returns {Promise<RolePermission[]>}
   */
  async findByPermisoId(permisoId) {
    const models = await this.getModel().findAll({
      where: {
        permisoId: permisoId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['rolId', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

