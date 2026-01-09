import { PlanSubject } from '../../domain/entities/PlanSubject.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: PlanSubjectMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (PlanSubject)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de PlanSubject
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de PlanSubject
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: PlanSubject (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + PlanSubjectMapper (campos específicos)
 * - Infrastructure Layer: PlanSubjectRepository (usa el mapper para conversiones)
 */
export class PlanSubjectMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de PlanSubject
   * 
   * @param {Object|null} model - Modelo Sequelize de AsignaturaPlan
   * @returns {PlanSubject|null} Entidad de dominio PlanSubject
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de PlanSubject (campos del dominio)
    const specificFields = {
      studyPlanId: model.planEstudioId ?? null,
      periodId: model.periodoId ?? null,
      subjectId: model.materiaId ?? null,
      weeklyHours: model.horasSemanales,
      credits: model.creditos ?? null,
      modality: model.modalidad,
      displayOrder: model.ordenVisualizacion,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new PlanSubject(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {PlanSubject|Object} entity - Entidad PlanSubject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad PlanSubject como objeto plano
    const data = entity instanceof PlanSubject ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      planEstudioId: data.studyPlanId ?? null,
      periodoId: data.periodId ?? null,
      materiaId: data.subjectId ?? null,
      horasSemanales: data.weeklyHours,
      creditos: data.credits ?? null,
      modalidad: data.modality,
      ordenVisualizacion: data.displayOrder !== undefined ? data.displayOrder : 1,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de PlanSubject
   * 
   * @param {PlanSubject|Object} entity - Entidad PlanSubject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad PlanSubject como objeto plano
    const data = entity instanceof PlanSubject ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de PlanSubject
    if (data.studyPlanId !== undefined) {
      updateData.planEstudioId = data.studyPlanId ?? null;
    }
    if (data.periodId !== undefined) {
      updateData.periodoId = data.periodId ?? null;
    }
    if (data.subjectId !== undefined) {
      updateData.materiaId = data.subjectId ?? null;
    }
    if (data.weeklyHours !== undefined) {
      updateData.horasSemanales = data.weeklyHours;
    }
    if (data.credits !== undefined) {
      updateData.creditos = data.credits ?? null;
    }
    if (data.modality !== undefined) {
      updateData.modalidad = data.modality;
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
   * @returns {PlanSubject[]} Array de entidades PlanSubject
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
