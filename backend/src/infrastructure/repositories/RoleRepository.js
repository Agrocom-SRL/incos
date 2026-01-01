import { IRolRepository } from '../../domain/interfaces/repositories/IRolRepository.js';
import { Rol as RolModel } from '../database/models/rol.js';
import { Role } from '../../domain/entities/Role.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de roles usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IRolRepository}
 * 
 * Esta clase cumple con el contrato IRolRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo() que es requerido por IRolRepository
 */
export class RoleRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de roles
   * @returns {Object} Modelo Rol
   */
  getModel() {
    return RolModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Role|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Role({
      id: model.id,
      code: model.codigo,
      name: model.nombre,
      accessLevel: model.nivelAcceso,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigo', 'nombre'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['nombre', 'ASC']];
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
      nombre: data.name,
      nivelAcceso: data.accessLevel !== undefined ? data.accessLevel : 1,
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
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.accessLevel !== undefined) {
      updateData.nivelAcceso = data.accessLevel;
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
    return 'roles';
  }

  /**
   * Método específico: Buscar rol por código
   * @param {string} codigo
   * @returns {Promise<Role|null>}
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
}

