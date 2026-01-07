import { IMunicipioRepository } from '../../domain/interfaces/repositories/IMunicipioRepository.js';
import { Municipio as MunicipioModel } from '../database/models/municipio.js';
import { BaseRepository } from './BaseRepository.js';
import { MunicipalityMapper } from '../mappers/MunicipalityMapper.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de municipios usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a MunicipalityMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa MunicipalityMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IMunicipioRepository
 * - Usa MunicipalityMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
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
   * Delega la responsabilidad de mapeo a MunicipalityMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Municipality|null} Entidad de dominio
   */
  toEntity(model) {
    return MunicipalityMapper.toEntity(model);
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
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a MunicipalityMapper
   * 
   * @param {Municipality|Object} data - Entidad Municipality o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return MunicipalityMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a MunicipalityMapper
   * 
   * @param {Municipality|Object} data - Entidad Municipality o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return MunicipalityMapper.toModelForUpdate(data);
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
   * 
   * @param {number} provinciaId - ID de la provincia
   * @returns {Promise<Municipality[]>} Array de entidades Municipality
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
    return MunicipalityMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar municipio por código
   * 
   * @param {string} codigo - Código del municipio
   * @returns {Promise<Municipality|null>} Entidad Municipality o null si no se encuentra
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

    return MunicipalityMapper.toEntityList(models);
  }
}
