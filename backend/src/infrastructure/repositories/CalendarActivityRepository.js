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
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
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
   * Maneja todos los criterios de búsqueda de la entidad CalendarActivity
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ academicPeriodId: 1 }) → Busca actividades de un periodo académico
   * - findAll({ activityId: 2, startDate: '2025-01-01' }) → Busca instancias de una actividad
   * - findBy({ academicPeriodId: 1, code: '2025-BIM1-001' }) → Busca actividad específica
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - academicPeriodId: ID del periodo académico
   *   - activityId: ID de la actividad del catálogo
   *   - code: Código de la actividad (búsqueda exacta, para búsqueda de texto usar search())
   *   - customName: Nombre personalizado (búsqueda exacta, para búsqueda de texto usar search())
   *   - careerIds: IDs de carreras (JSON array, búsqueda exacta)
   *   - startDate: Fecha de inicio
   *   - endDate: Fecha de fin
   *   - isAllDay: Si es todo el día (true/false)
   *   - schedule: Horario (JSON, búsqueda exacta)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.academicPeriodId) {
      where.periodoAcademicoId = filters.academicPeriodId;
    }
    if (filters.activityId) {
      where.actividadId = filters.activityId;
    }
    if (filters.code !== undefined) {
      where.codigo = filters.code;
    }
    if (filters.customName !== undefined) {
      where.nombrePersonalizado = filters.customName;
    }
    if (filters.careerIds !== undefined) {
      where.carrerasIds = filters.careerIds;
    }
    if (filters.startDate !== undefined) {
      where.fechaInicio = filters.startDate;
    }
    if (filters.endDate !== undefined) {
      where.fechaFin = filters.endDate;
    }
    if (filters.isAllDay !== undefined) {
      where.esTodoElDia = filters.isAllDay;
    }
    if (filters.schedule !== undefined) {
      where.horario = filters.schedule;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda de texto
   * Estos campos se usan en el método search() para búsqueda por término
   * 
   * @returns {string[]} Array de nombres de campos del modelo Sequelize
   */
  getSearchFields() {
    return ['nombrePersonalizado', 'codigo'];
  }

  /**
   * Retorna el orden por defecto para las consultas
   * Delega el orden al BaseRepository que ordena por ID ASC
   * 
   * @returns {Array} Array vacío para usar el orden por defecto del BaseRepository (id ASC)
   */
  getDefaultSort() {
    return []; // Usa el orden por defecto de BaseRepository: [['id', 'ASC']]
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
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'calendarActivities';
  }
}
