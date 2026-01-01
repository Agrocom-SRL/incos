import { IPeriodoRepository } from '../../domain/interfaces/repositories/IPeriodoRepository.js';
import { Periodo as PeriodoModel } from '../database/models/periodo.js';
import { Period } from '../../domain/entities/Period.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de periodos académicos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IPeriodoRepository}
 * 
 * Esta clase cumple con el contrato IPeriodoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCarreraId() que es requerido por IPeriodoRepository
 */
export class PeriodRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de periodos
   * @returns {Object} Modelo Periodo
   */
  getModel() {
    return PeriodoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Period|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Period({
      id: model.id,
      careerId: model.carreraId,
      name: model.nombre,
      number: model.numero,
      displayOrder: model.ordenVisualizacion,
      description: model.descripcion,
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

    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }

    return where;
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
    return [['ordenVisualizacion', 'ASC'], ['numero', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      carreraId: data.careerId || null,
      nombre: data.name,
      numero: data.number,
      ordenVisualizacion: data.displayOrder !== undefined ? data.displayOrder : 1,
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

    if (data.careerId !== undefined) {
      updateData.carreraId = data.careerId || null;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.number !== undefined) {
      updateData.numero = data.number;
    }
    if (data.displayOrder !== undefined) {
      updateData.ordenVisualizacion = data.displayOrder;
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
    return 'periods';
  }

  /**
   * Método específico: Buscar periodos por carrera
   * @param {number} carreraId
   * @returns {Promise<Period[]>}
   */
  async findByCarreraId(carreraId) {
    const models = await this.getModel().findAll({
      where: {
        carreraId: carreraId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['ordenVisualizacion', 'ASC'], ['numero', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

