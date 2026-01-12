import { IAsignaturaPlanRepository } from '../../domain/interfaces/repositories/IAsignaturaPlanRepository.js';
import { AsignaturaPlan as AsignaturaPlanModel } from '../database/models/asignatura_plan.js';
import { BaseRepository } from './BaseRepository.js';
import { PlanSubjectMapper } from '../mappers/PlanSubjectMapper.js';

/**
 * Implementación del repositorio de asignaturas de plan usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a PlanSubjectMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa PlanSubjectMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IAsignaturaPlanRepository
 * - Usa PlanSubjectMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IAsignaturaPlanRepository}
 * 
 * Esta clase cumple con el contrato IAsignaturaPlanRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 */
export class PlanSubjectRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de asignaturas de plan
   * @returns {Object} Modelo AsignaturaPlan
   */
  getModel() {
    return AsignaturaPlanModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a PlanSubjectMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {PlanSubject|null} Entidad de dominio
   */
  toEntity(model) {
    return PlanSubjectMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.studyPlanId) {
      where.planEstudioId = filters.studyPlanId;
    }
    if (filters.periodId) {
      where.periodoId = filters.periodId;
    }
    if (filters.subjectId) {
      where.materiaId = filters.subjectId;
    }
    if (filters.modality) {
      where.modalidad = filters.modality;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return [];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { 
    return [['ordenVisualizacion', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a PlanSubjectMapper
   * 
   * @param {PlanSubject|Object} data - Entidad PlanSubject o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return PlanSubjectMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a PlanSubjectMapper
   * 
   * @param {PlanSubject|Object} data - Entidad PlanSubject o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return PlanSubjectMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'planSubjects';
  }
}
