import { IActividadRepository } from '../../domain/interfaces/repositories/IActividadRepository.js';
import { Actividad as ActividadModel } from '../database/models/actividad.js';
import { BaseRepository } from './BaseRepository.js';
import { ActivityMapper } from '../mappers/ActivityMapper.js';

/**
 * Implementación del repositorio de actividades usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ActivityMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ActivityMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IActividadRepository
 * - Usa ActivityMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IActividadRepository}
 * 
 * Esta clase cumple con el contrato IActividadRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 */
export class ActivityRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de actividades
   * @returns {Object} Modelo Actividad
   */
  getModel() {
    return ActividadModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a ActivityMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Activity|null} Entidad de dominio
   */
  toEntity(model) {
    return ActivityMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.type) {
      where.tipo = filters.type;
    }
    if (filters.isHighlighted !== undefined) {
      where.esDestacada = filters.isHighlighted;
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
    return [['nombre', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a ActivityMapper
   * 
   * @param {Activity|Object} data - Entidad Activity o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return ActivityMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a ActivityMapper
   * 
   * @param {Activity|Object} data - Entidad Activity o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return ActivityMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'activities';
  }
}
