import { IPermisoRepository } from '../../domain/interfaces/repositories/IPermisoRepository.js';
import { Permiso as PermisoModel } from '../database/models/Permiso.js';
import { Permission } from '../../domain/entities/Permission.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de permisos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
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
   * @param {Object} model
   * @returns {Permission|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Permission({
      id: model.id,
      code: model.codigo,
      module: model.modulo,
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
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      codigo: data.code,
      modulo: data.module,
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

    if (data.code !== undefined) {
      updateData.codigo = data.code;
    }
    if (data.module !== undefined) {
      updateData.modulo = data.module;
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
    return 'permissions';
  }

  /**
   * Método específico: Buscar permiso por código
   * @param {string} codigo
   * @returns {Promise<Permission|null>}
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
   * @param {string} modulo
   * @returns {Promise<Permission[]>}
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
    return models.map((model) => this.toEntity(model));
  }
}

