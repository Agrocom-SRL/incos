import { ITipoDiscapacidadRepository } from '../../domain/interfaces/repositories/ITipoDiscapacidadRepository.js';
import { TipoDiscapacidad as TipoDiscapacidadModel } from '../database/models/TipoDiscapacidad.js';
import { DisabilityType } from '../../domain/entities/DisabilityType.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de tipos de discapacidad usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {ITipoDiscapacidadRepository}
 * 
 * Esta clase cumple con el contrato ITipoDiscapacidadRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 */
export class DisabilityTypeRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de tipos de discapacidad
   * @returns {Object} Modelo TipoDiscapacidad
   */
  getModel() {
    return TipoDiscapacidadModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {DisabilityType|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new DisabilityType({
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
    return 'disabilityTypes';
  }
}

