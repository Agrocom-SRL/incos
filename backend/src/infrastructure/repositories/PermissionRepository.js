import { IPermisoRepository } from '../../domain/interfaces/repositories/IPermisoRepository.js';
import { Permiso as PermisoModel } from '../database/models/permiso.js';
import { BaseRepository } from './BaseRepository.js';
import { PermissionMapper } from '../mappers/PermissionMapper.js';

/**
 * Implementación del repositorio de permisos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a PermissionMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa PermissionMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IPermisoRepository
 * - Usa PermissionMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IPermisoRepository}
 * 
 * Esta clase cumple con el contrato IPermisoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo() y findByModulo() que son requeridos por IPermisoRepository
 */
export class PermissionRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de permisos
   * @returns {Object} Modelo Permiso
   */
  getModel() {
    return PermisoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a PermissionMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Permission|null} Entidad de dominio
   */
  toEntity(model) {
    return PermissionMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.module) {
      where.modulo = filters.module;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigo', 'modulo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['modulo', 'ASC'], ['codigo', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a PermissionMapper
   * 
   * @param {Permission|Object} data - Entidad Permission o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return PermissionMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a PermissionMapper
   * 
   * @param {Permission|Object} data - Entidad Permission o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return PermissionMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'permissions';
  }

  /**
   * Método específico: Buscar permiso por código
   * 
   * @param {string} codigo - Código del permiso
   * @returns {Promise<Permission|null>} Entidad Permission o null si no se encuentra
   */
  async findByCodigo(codigo) {
    const model = await this.getModel().findOne({
      where: {
        codigo: codigo,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Buscar permisos por módulo
   * 
   * @param {string} modulo - Módulo del sistema
   * @returns {Promise<Permission[]>} Array de entidades Permission
   */
  async findByModulo(modulo) {
    const models = await this.getModel().findAll({
      where: {
        modulo: modulo,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['codigo', 'ASC']],
    });
    return PermissionMapper.toEntityList(models);
  }
}

