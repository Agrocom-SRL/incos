import { IPaisRepository } from '../../domain/interfaces/repositories/IPaisRepository.js';
import { Pais as PaisModel } from '../database/models/pais.js';
import { Country } from '../../domain/entities/Country.js';
import { BaseRepository } from './BaseRepository.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de países usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IPaisRepository}
 * 
 * Esta clase cumple con el contrato IPaisRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigoIso() que es requerido por IPaisRepository
 */
export class CountryRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de países
   * @returns {Object} Modelo Pais
   */
  getModel() {
    return PaisModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Country|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Country({
      id: model.id,
      name: model.nombre,
      isoCode: model.codigoIso,
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
    return ['nombre', 'codigoIso'];
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
      codigoIso: data.isoCode ? data.isoCode.toUpperCase() : null,
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
    if (data.isoCode !== undefined) {
      updateData.codigoIso = data.isoCode.toUpperCase();
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
    return 'countries';
  }

  /**
   * Método específico: Buscar país por código ISO
   * Este método no está en la clase base porque es específico de países
   * @param {string} codigoIso
   * @returns {Promise<Country|null>}
   */
  async findByCodigoIso(codigoIso) {
    const model = await this.getModel().findOne({
      where: {
        codigoIso: codigoIso.toUpperCase(),
        activo: true,
      },
    });
    return this.toEntity(model);
  }

  /**
   * Sobrescribe el método search para incluir búsqueda case-insensitive en código ISO
   * Respeta el filtro de registros eliminados (paranoid: true) y el estado activo
   * @param {string} searchTerm
   * @param {Object} options - Opciones opcionales (includeInactive)
   * @returns {Promise<Country[]>}
   */
  async search(searchTerm, options = {}) {
    const Model = this.getModel();

    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      [Op.or]: [
        { nombre: { [Op.like]: `%${searchTerm}%` } },
        { codigoIso: { [Op.like]: `%${searchTerm.toUpperCase()}%` } },
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
