import { ITipoParentescoRepository } from '../../domain/interfaces/repositories/ITipoParentescoRepository.js';
import { TipoParentesco as TipoParentescoModel } from '../database/models/tipo_parentesco.js';
import { RelationshipType } from '../../domain/entities/RelationshipType.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de tipos de parentesco usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {ITipoParentescoRepository}
 * 
 * Esta clase cumple con el contrato ITipoParentescoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 */
export class RelationshipTypeRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de tipos de parentesco
   * @returns {Object} Modelo TipoParentesco
   */
  getModel() {
    return TipoParentescoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {RelationshipType|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new RelationshipType({
      id: model.id,
      name: model.nombre,
      description: model.descripcion,
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
    return ['nombre', 'descripcion'];
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
      nombre: data.name,
      descripcion: data.description || null,
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

    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
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
    return 'relationshipTypes';
  }
}

