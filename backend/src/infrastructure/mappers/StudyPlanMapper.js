import { StudyPlan } from '../../domain/entities/StudyPlan.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudyPlanMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (StudyPlan)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de StudyPlan
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de StudyPlan
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: StudyPlan (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudyPlanMapper (campos específicos)
 * - Infrastructure Layer: StudyPlanRepository (usa el mapper para conversiones)
 */
export class StudyPlanMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudyPlan
   * 
   * @param {Object|null} model - Modelo Sequelize de PlanEstudios
   * @returns {StudyPlan|null} Entidad de dominio StudyPlan
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudyPlan (campos del dominio)
    const specificFields = {
      careerId: model.carreraId,
      periodId: model.periodoId,
      subjectId: model.materiaId,
      displayOrder: model.ordenVisualizacion,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudyPlan(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {StudyPlan|Object} entity - Entidad StudyPlan o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudyPlan como objeto plano
    const data = entity instanceof StudyPlan ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      carreraId: data.careerId || null,
      periodoId: data.periodId || null,
      materiaId: data.subjectId || null,
      ordenVisualizacion: data.displayOrder !== undefined ? data.displayOrder : 1,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudyPlan
   * 
   * @param {StudyPlan|Object} entity - Entidad StudyPlan o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudyPlan como objeto plano
    const data = entity instanceof StudyPlan ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudyPlan
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

    // Campos base (active/activo)
    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades de dominio
   * 
   * @param {Array} models - Array de modelos Sequelize
   * @returns {StudyPlan[]} Array de entidades StudyPlan
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

