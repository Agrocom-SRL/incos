import { IEstadoCivilRepository } from '../../domain/interfaces/repositories/IEstadoCivilRepository.js';
import { EstadoCivil as EstadoCivilModel } from '../database/models/estado_civil.js';
import { CivilStatus } from '../../domain/entities/CivilStatus.js';
import { BaseRepository } from './BaseRepository.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de estados civiles usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IEstadoCivilRepository}
 * 
 * Esta clase cumple con el contrato IEstadoCivilRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 */
export class CivilStatusRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de estados civiles
   * @returns {Object} Modelo EstadoCivil
   */
  getModel() {
    return EstadoCivilModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {CivilStatus|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new CivilStatus({
      id: model.id,
      name: model.nombre,
      abbreviation: model.abreviatura,
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
    return ['nombre', 'abreviatura'];
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
      abreviatura: data.abbreviation ? data.abbreviation.toUpperCase() : null,
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
    if (data.abbreviation !== undefined) {
      updateData.abreviatura = data.abbreviation ? data.abbreviation.toUpperCase() : null;
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
    return 'civilStatuses';
  }

  /**
   * Sobrescribe el método search para incluir búsqueda case-insensitive en abreviatura
   * Respeta el filtro de registros eliminados (paranoid: true) y el estado activo
   * @param {string} searchTerm
   * @param {Object} options - Opciones opcionales (includeInactive)
   * @returns {Promise<CivilStatus[]>}
   */
  async search(searchTerm, options = {}) {
    const Model = this.getModel();

    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      [Op.or]: [
        { nombre: { [Op.like]: `%${searchTerm}%` } },
        { abreviatura: { [Op.like]: `%${searchTerm.toUpperCase()}%` } },
      ],
    };

    // Filtrar por estado activo/inactivo (solo si no se solicita incluir inactivos)
    if (!options.includeInactive) {
      where.activo = true; // Solo registros activos por defecto
    }

    const models = await Model.findAll({
      where,
      order: this.getDefaultSort(),
      limit: 50,
    });

    return models.map((model) => this.toEntity(model));
  }
}

