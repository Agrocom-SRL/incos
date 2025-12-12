import { IPlanEstudiosRepository } from '../../domain/interfaces/repositories/IPlanEstudiosRepository.js';
import { PlanEstudios as PlanEstudiosModel } from '../database/models/PlanEstudios.js';
import { StudyPlan } from '../../domain/entities/StudyPlan.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de plan de estudios usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
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
   * @param {Object} model
   * @returns {StudyPlan|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new StudyPlan({
      id: model.id,
      careerId: model.carreraId,
      periodId: model.periodoId,
      subjectId: model.materiaId,
      displayOrder: model.ordenVisualizacion,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
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
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      carreraId: data.careerId || null,
      periodoId: data.periodId || null,
      materiaId: data.subjectId || null,
      ordenVisualizacion: data.displayOrder !== undefined ? data.displayOrder : 1,
    };
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

    if (data.careerId !== undefined) {
      updateData.carreraId = data.careerId || null;
    }
    if (data.periodId !== undefined) {
      updateData.periodoId = data.periodId || null;
    }
    if (data.subjectId !== undefined) {
      updateData.materiaId = data.subjectId || null;
    }
    if (data.displayOrder !== undefined) {
      updateData.ordenVisualizacion = data.displayOrder;
    }
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }

    return updateData;
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
   * @param {number} carreraId
   * @returns {Promise<StudyPlan[]>}
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
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar plan de estudios por periodo
   * @param {number} periodoId
   * @returns {Promise<StudyPlan[]>}
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
    return models.map((model) => this.toEntity(model));
  }
}

