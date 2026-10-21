import { PlanEstudios as PlanEstudiosModel } from '../database/models/plan_estudios.js';
import { BaseRepository } from './BaseRepository.js';
import { StudyPlanMapper } from '../mappers/StudyPlanMapper.js';

/**
 * Implementación del repositorio de plan de estudios usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudyPlanMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudyPlanMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IPlanEstudiosRepository
 * - Usa StudyPlanMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IPlanEstudiosRepository}
 *
 * Esta clase cumple con el contrato IPlanEstudiosRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 *
 * IMPORTANTE: Se eliminaron findByCarreraId() y findByPeriodoId() porque son redundantes.
 * Usar en su lugar:
 * - findAll({ careerId: X, sort: 'vigente:DESC' }) → Reemplaza findByCarreraId()
 * - findAll({ periodId: X, sort: 'vigente:DESC' }) → Reemplaza findByPeriodoId()
 */
export class StudyPlanRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de plan de estudios
   * @returns {Object} Modelo PlanEstudios
   */
  getModel() {
    return PlanEstudiosModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudyPlanMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {StudyPlan|null} Entidad de dominio
   */
  toEntity(model) {
    return StudyPlanMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad StudyPlan
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ careerId: 1 }) → Busca planes de una carrera
   * - findAll({ careerId: 1, isActive: true }) → Busca planes activos de una carrera
   * - findAll({ durationYears: 5 }) → Busca planes con duración específica
   * - findBy({ careerId: 1, planName: 'Plan 2025' }) → Busca por ambos criterios
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - careerId: ID de la carrera
   *   - planName: Nombre del plan (búsqueda exacta, para búsqueda de texto usar search())
   *   - ministerialResolution: Resolución ministerial (búsqueda exacta, para búsqueda de texto usar search())
   *   - documentPath: Ruta del documento
   *   - durationYears: Duración en años
   *   - totalHours: Carga horaria total
   *   - hoursPerWeek: Horas por semana
   *   - hoursPerMonth: Horas por mes
   *   - hoursPerYear: Horas por año
   *   - observations: Observaciones (búsqueda exacta, para búsqueda de texto usar search())
   *   - isActive: Si el plan está vigente (true/false)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }
    if (filters.planName !== undefined) {
      where.nombrePlan = filters.planName;
    }
    if (filters.ministerialResolution !== undefined) {
      where.resolucionMinisterial = filters.ministerialResolution;
    }
    if (filters.documentPath !== undefined) {
      where.documentoRuta = filters.documentPath;
    }
    if (filters.durationYears !== undefined) {
      where.duracionAnios = filters.durationYears;
    }
    if (filters.totalHours !== undefined) {
      where.cargaHorariaTotal = filters.totalHours;
    }
    if (filters.hoursPerWeek !== undefined) {
      where.horasSemana = filters.hoursPerWeek;
    }
    if (filters.hoursPerMonth !== undefined) {
      where.horasMes = filters.hoursPerMonth;
    }
    if (filters.hoursPerYear !== undefined) {
      where.horasAnio = filters.hoursPerYear;
    }
    if (filters.observations !== undefined) {
      // Permite búsqueda exacta de observaciones
      // Para búsqueda de texto parcial, usar el método search()
      where.observaciones = filters.observations;
    }
    if (filters.isActive !== undefined) {
      where.vigente = filters.isActive;
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
    return ['nombrePlan', 'resolucionMinisterial'];
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
   * Delega la responsabilidad de mapeo a StudyPlanMapper
   *
   * @param {StudyPlan|Object} data - Entidad StudyPlan o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return StudyPlanMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudyPlanMapper
   *
   * @param {StudyPlan|Object} data - Entidad StudyPlan o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return StudyPlanMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'studyPlans';
  }
}
