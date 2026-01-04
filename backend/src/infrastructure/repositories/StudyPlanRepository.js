import { IPlanEstudiosRepository } from '../../domain/interfaces/repositories/IPlanEstudiosRepository.js';
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
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCarreraId() y findByPeriodoId() que son requeridos por IPlanEstudiosRepository
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
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }
    if (filters.periodId) {
      where.periodoId = filters.periodId;
    }
    if (filters.subjectId) {
      where.materiaId = filters.subjectId;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['ordenVisualizacion'];
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
   * Delega la responsabilidad de mapeo a StudyPlanMapper
   * 
   * @param {StudyPlan|Object} data - Entidad StudyPlan o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
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
  mapDataToUpdate(data, userId = null) {
    return StudyPlanMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'studyPlans';
  }

  /**
   * Método específico: Buscar plan de estudios por carrera
   * 
   * @param {number} carreraId - ID de la carrera
   * @returns {Promise<StudyPlan[]>} Array de entidades StudyPlan
   */
  async findByCarreraId(carreraId) {
    const models = await this.getModel().findAll({
      where: {
        carreraId: carreraId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['ordenVisualizacion', 'ASC']],
    });
    return StudyPlanMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar plan de estudios por periodo
   * 
   * @param {number} periodoId - ID del periodo
   * @returns {Promise<StudyPlan[]>} Array de entidades StudyPlan
   */
  async findByPeriodoId(periodoId) {
    const models = await this.getModel().findAll({
      where: {
        periodoId: periodoId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['ordenVisualizacion', 'ASC']],
    });
    return StudyPlanMapper.toEntityList(models);
  }
}

