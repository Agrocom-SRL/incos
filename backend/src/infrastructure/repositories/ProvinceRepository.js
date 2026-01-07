import { IProvinciaRepository } from '../../domain/interfaces/repositories/IProvinciaRepository.js';
import { Provincia as ProvinciaModel } from '../database/models/provincia.js';
import { BaseRepository } from './BaseRepository.js';
import { ProvinceMapper } from '../mappers/ProvinceMapper.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de provincias usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ProvinceMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ProvinceMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IProvinciaRepository
 * - Usa ProvinceMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IProvinciaRepository}
 * 
 * Esta clase cumple con el contrato IProvinciaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByDepartamentoId() y findByCodigo() que son requeridos por IProvinciaRepository
 */
export class ProvinceRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de provincias
   * @returns {Object} Modelo Provincia
   */
  getModel() {
    return ProvinciaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a ProvinceMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Province|null} Entidad de dominio
   */
  toEntity(model) {
    return ProvinceMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.departmentId) {
      where.departamentoId = filters.departmentId;
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
   * Delega la responsabilidad de mapeo a ProvinceMapper
   * 
   * @param {Province|Object} data - Entidad Province o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return ProvinceMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a ProvinceMapper
   * 
   * @param {Province|Object} data - Entidad Province o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return ProvinceMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'provinces';
  }

  /**
   * Método específico: Buscar provincias por departamento
   * 
   * @param {number} departamentoId - ID del departamento
   * @returns {Promise<Province[]>} Array de entidades Province
   */
  async findByDepartamentoId(departamentoId) {
    const models = await this.getModel().findAll({
      where: {
        departamentoId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['nombre', 'ASC']],
    });
    return ProvinceMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar provincia por código
   * 
   * @param {string} codigo - Código de la provincia
   * @returns {Promise<Province|null>} Entidad Province o null si no se encuentra
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
   * @returns {Promise<Province[]>}
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

    return ProvinceMapper.toEntityList(models);
  }
}
