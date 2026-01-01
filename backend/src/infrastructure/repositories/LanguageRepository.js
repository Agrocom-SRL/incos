import { IIdiomaRepository } from '../../domain/interfaces/repositories/IIdiomaRepository.js';
import { Idioma as IdiomaModel } from '../database/models/idioma.js';
import { Language } from '../../domain/entities/Language.js';
import { BaseRepository } from './BaseRepository.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de idiomas usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IIdiomaRepository}
 * 
 * Esta clase cumple con el contrato IIdiomaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigoIso() que es requerido por IIdiomaRepository
 */
export class LanguageRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de idiomas
   * @returns {Object} Modelo Idioma
   */
  getModel() {
    return IdiomaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Language|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Language({
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
      codigoIso: data.isoCode ? data.isoCode.toLowerCase() : null,
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
      updateData.codigoIso = data.isoCode ? data.isoCode.toLowerCase() : null;
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
    return 'languages';
  }

  /**
   * Método específico: Buscar idioma por código ISO
   * @param {string} codigoIso
   * @returns {Promise<Language|null>}
   */
  async findByCodigoIso(codigoIso) {
    const model = await this.getModel().findOne({
      where: {
        codigoIso: codigoIso.toLowerCase(),
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Sobrescribe el método search para incluir búsqueda case-insensitive en código ISO
   * Respeta el filtro de registros eliminados (paranoid: true) y el estado activo
   * @param {string} searchTerm
   * @param {Object} options - Opciones opcionales (includeInactive)
   * @returns {Promise<Language[]>}
   */
  async search(searchTerm, options = {}) {
    const Model = this.getModel();

    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      [Op.or]: [
        { nombre: { [Op.like]: `%${searchTerm}%` } },
        { codigoIso: { [Op.like]: `%${searchTerm.toLowerCase()}%` } },
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

