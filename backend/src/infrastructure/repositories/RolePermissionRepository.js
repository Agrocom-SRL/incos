import { IRolPermisoRepository } from '../../domain/interfaces/repositories/IRolPermisoRepository.js';
import { RolPermiso as RolPermisoModel } from '../database/models/rol_permiso.js';
import { BaseRepository } from './BaseRepository.js';
import { RolePermissionMapper } from '../mappers/RolePermissionMapper.js';

/**
 * Implementación del repositorio de roles-permisos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a RolePermissionMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa RolePermissionMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IRolPermisoRepository
 * - Usa RolePermissionMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
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
   * Delega la responsabilidad de mapeo a RolePermissionMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {RolePermission|null} Entidad de dominio
   */
  toEntity(model) {
    return RolePermissionMapper.toEntity(model);
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
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a RolePermissionMapper
   * 
   * @param {RolePermission|Object} data - Entidad RolePermission o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return RolePermissionMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a RolePermissionMapper
   * 
   * @param {RolePermission|Object} data - Entidad RolePermission o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return RolePermissionMapper.toModelForUpdate(data);
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
   * 
   * @param {number} rolId - ID del rol
   * @returns {Promise<RolePermission[]>} Array de entidades RolePermission
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
    return RolePermissionMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar roles por permiso
   * 
   * @param {number} permisoId - ID del permiso
   * @returns {Promise<RolePermission[]>} Array de entidades RolePermission
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
    return RolePermissionMapper.toEntityList(models);
  }
}

