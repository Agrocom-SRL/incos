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
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
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
   * Maneja todos los criterios de búsqueda de la entidad PlanSubject
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ studyPlanId: 1 }) → Busca asignaturas de un plan de estudios
   * - findAll({ periodId: 2, modality: 'REGULAR' }) → Busca asignaturas regulares de un periodo
   * - findBy({ studyPlanId: 1, periodId: 2, subjectId: 3 }) → Busca asignatura específica
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studyPlanId: ID del plan de estudios
   *   - periodId: ID del periodo
   *   - subjectId: ID de la materia
   *   - weeklyHours: Horas semanales
   *   - credits: Créditos
   *   - modality: Modalidad (REGULAR, INTENSIVO, etc.)
   *   - displayOrder: Orden de visualización
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.studyPlanId) {
      where.planEstudioId = filters.studyPlanId;
    }
    if (filters.periodId) {
      where.periodoId = filters.periodId;
    }
    if (filters.subjectId) {
      where.materiaId = filters.subjectId;
    }
    if (filters.weeklyHours !== undefined) {
      where.horasSemanales = filters.weeklyHours;
    }
    if (filters.credits !== undefined) {
      where.creditos = filters.credits;
    }
    if (filters.modality) {
      where.modalidad = filters.modality;
    }
    if (filters.displayOrder !== undefined) {
      where.ordenVisualizacion = filters.displayOrder;
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
    return [];
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
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'planSubjects';
  }
}
