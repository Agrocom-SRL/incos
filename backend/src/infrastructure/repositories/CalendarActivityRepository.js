import { IActividadCalendarioRepository } from '../../domain/interfaces/repositories/IActividadCalendarioRepository.js';
import { ActividadCalendario as ActividadCalendarioModel } from '../database/models/actividad_calendario.js';
import { BaseRepository } from './BaseRepository.js';
import { CalendarActivityMapper } from '../mappers/CalendarActivityMapper.js';

/**
 * Implementación del repositorio de actividades de calendario usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CalendarActivityMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CalendarActivityMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IActividadCalendarioRepository
 * - Usa CalendarActivityMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IActividadCalendarioRepository}
 * 
 * Esta clase cumple con el contrato IActividadCalendarioRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 */
export class CalendarActivityRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de actividades de calendario
   * @returns {Object} Modelo ActividadCalendario
   */
  getModel() {
    return ActividadCalendarioModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a CalendarActivityMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {CalendarActivity|null} Entidad de dominio
   */
  toEntity(model) {
    return CalendarActivityMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.academicPeriodId) {
      where.periodoAcademicoId = filters.academicPeriodId;
    }
    if (filters.activityId) {
      where.actividadId = filters.activityId;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombrePersonalizado', 'codigo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { 
    return [['fechaInicio', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a CalendarActivityMapper
   * 
   * @param {CalendarActivity|Object} data - Entidad CalendarActivity o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return CalendarActivityMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a CalendarActivityMapper
   * 
   * @param {CalendarActivity|Object} data - Entidad CalendarActivity o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return CalendarActivityMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'calendarActivities';
  }
}
