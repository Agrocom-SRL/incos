import { IPeriodoRepository } from '../../domain/interfaces/repositories/IPeriodoRepository.js';
import { Periodo as PeriodoModel } from '../database/models/periodo.js';
import { BaseRepository } from './BaseRepository.js';
import { PeriodMapper } from '../mappers/PeriodMapper.js';

/**
 * Implementación del repositorio de periodos académicos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a PeriodMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa PeriodMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IPeriodoRepository
 * - Usa PeriodMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
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
   * Delega la responsabilidad de mapeo a PeriodMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Period|null} Entidad de dominio
   */
  toEntity(model) {
    return PeriodMapper.toEntity(model);
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
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a PeriodMapper
   * 
   * @param {Period|Object} data - Entidad Period o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return PeriodMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a PeriodMapper
   * 
   * @param {Period|Object} data - Entidad Period o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return PeriodMapper.toModelForUpdate(data);
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
   * 
   * @param {number} carreraId - ID de la carrera
   * @returns {Promise<Period[]>} Array de entidades Period
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
    return PeriodMapper.toEntityList(models);
  }
}

