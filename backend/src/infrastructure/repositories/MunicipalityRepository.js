import { IMunicipioRepository } from '../../domain/interfaces/repositories/IMunicipioRepository.js';
import { Municipio as MunicipioModel } from '../database/models/municipio.js';
import { Municipality } from '../../domain/entities/Municipality.js';
import { BaseRepository } from './BaseRepository.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de municipios usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IMunicipioRepository}
 * 
 * Esta clase cumple con el contrato IMunicipioRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByProvinciaId() y findByCodigo() que son requeridos por IMunicipioRepository
 */
export class MunicipalityRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de municipios
   * @returns {Object} Modelo Municipio
   */
  getModel() {
    return MunicipioModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Municipality|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Municipality({
      id: model.id,
      provinceId: model.provinciaId,
      name: model.nombre,
      code: model.codigo,
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

    if (filters.provinceId) {
      where.provinciaId = filters.provinceId;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'codigo'];
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
      provinciaId: data.provinceId,
      nombre: data.name,
      codigo: data.code ? data.code.toUpperCase() : null,
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

    if (data.provinceId !== undefined) {
      updateData.provinciaId = data.provinceId;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.code !== undefined) {
      updateData.codigo = data.code ? data.code.toUpperCase() : null;
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
    return 'municipalities';
  }

  /**
   * Método específico: Buscar municipios por provincia
   * @param {number} provinciaId
   * @returns {Promise<Municipality[]>}
   */
  async findByProvinciaId(provinciaId) {
    const models = await this.getModel().findAll({
      where: {
        provinciaId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['nombre', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar municipio por código
   * @param {string} codigo
   * @returns {Promise<Municipality|null>}
   */
  async findByCodigo(codigo) {
    const model = await this.getModel().findOne({
      where: {
        codigo: codigo.toUpperCase(),
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Sobrescribe el método search para incluir búsqueda case-insensitive en código
   * Respeta el filtro de registros eliminados (paranoid: true) y el estado activo
   * @param {string} searchTerm
   * @param {Object} options - Opciones opcionales (includeInactive)
   * @returns {Promise<Municipality[]>}
   */
  async search(searchTerm, options = {}) {
    const Model = this.getModel();

    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      [Op.or]: [
        { nombre: { [Op.like]: `%${searchTerm}%` } },
        { codigo: { [Op.like]: `%${searchTerm.toUpperCase()}%` } },
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
