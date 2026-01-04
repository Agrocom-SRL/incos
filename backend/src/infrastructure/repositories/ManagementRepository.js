import { IGestionRepository } from '../../domain/interfaces/repositories/IGestionRepository.js';
import { Gestion as GestionModel } from '../database/models/gestion.js';
import { BaseRepository } from './BaseRepository.js';
import { ManagementMapper } from '../mappers/ManagementMapper.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de gestiones académicas usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ManagementMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ManagementMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IGestionRepository
 * - Usa ManagementMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IGestionRepository}
 * 
 * Esta clase cumple con el contrato IGestionRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo(), findByAnio() y findActive() que son requeridos por IGestionRepository
 */
export class ManagementRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de gestiones
   * @returns {Object} Modelo Gestion
   */
  getModel() {
    return GestionModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a ManagementMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Management|null} Entidad de dominio
   */
  toEntity(model) {
    return ManagementMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.year) {
      where.anio = filters.year;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['anio', 'DESC'], ['codigo', 'DESC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a ManagementMapper
   * 
   * @param {Management|Object} data - Entidad Management o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return ManagementMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a ManagementMapper
   * 
   * @param {Management|Object} data - Entidad Management o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return ManagementMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'managements';
  }

  /**
   * Método específico: Buscar gestión por código
   * 
   * @param {string} codigo - Código de la gestión
   * @returns {Promise<Management|null>} Entidad Management o null si no se encuentra
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

  /**
   * Método específico: Buscar gestiones por año
   * 
   * @param {number} anio - Año académico
   * @returns {Promise<Management[]>} Array de entidades Management
   */
  async findByAnio(anio) {
    const models = await this.getModel().findAll({
      where: {
        anio: anio,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['codigo', 'DESC']],
    });
    return ManagementMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar gestión activa actual
   * 
   * @returns {Promise<Management|null>} Entidad Management o null si no se encuentra
   */
  async findActive() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const model = await this.getModel().findOne({
      where: {
        activo: true,
        fechaInicioAdministrativa: { [Op.lte]: today },
        fechaFinAdministrativa: { [Op.gte]: today },
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['codigo', 'DESC']],
    });
    return this.toEntity(model);
  }
}

