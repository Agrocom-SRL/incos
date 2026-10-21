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
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   *
   * Flujo: Base de Datos → ORM Model → Domain Entity
   *
   * @param {Object|null} model - Modelo Sequelize de AsignaturaPlan
   * @returns {PlanSubject|null} Entidad de dominio PlanSubject
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de PlanSubject (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('planEstudioId' in dataValues && dataValues.planEstudioId !== undefined) {
      specificFields.studyPlanId = dataValues.planEstudioId ?? null;
    }
    if ('periodoId' in dataValues && dataValues.periodoId !== undefined) {
      specificFields.periodId = dataValues.periodoId ?? null;
    }
    if ('materiaId' in dataValues && dataValues.materiaId !== undefined) {
      specificFields.subjectId = dataValues.materiaId ?? null;
    }
    if ('horasSemanales' in dataValues && dataValues.horasSemanales !== undefined) {
      specificFields.weeklyHours = dataValues.horasSemanales;
    }
    if ('creditos' in dataValues && dataValues.creditos !== undefined) {
      specificFields.credits = dataValues.creditos ?? null;
    }
    if ('modalidad' in dataValues && dataValues.modalidad !== undefined) {
      specificFields.modality = dataValues.modalidad;
    }
    if ('ordenVisualizacion' in dataValues && dataValues.ordenVisualizacion !== undefined) {
      specificFields.displayOrder = dataValues.ordenVisualizacion;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new PlanSubject(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   *
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   *
   * @param {PlanSubject|Object} entity - Entidad PlanSubject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad PlanSubject como objeto plano
    const data = entity instanceof PlanSubject ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
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
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de PlanSubject
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   *
   * @param {PlanSubject|Object} entity - Entidad PlanSubject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad PlanSubject como objeto plano
    const data = entity instanceof PlanSubject ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de PlanSubject
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studyPlanId' in data) {
      updateData.planEstudioId = data.studyPlanId ?? null;
    }
    if ('periodId' in data) {
      updateData.periodoId = data.periodId ?? null;
    }
    if ('subjectId' in data) {
      updateData.materiaId = data.subjectId ?? null;
    }
    if ('weeklyHours' in data) {
      updateData.horasSemanales = data.weeklyHours;
    }
    if ('credits' in data) {
      updateData.creditos = data.credits ?? null;
    }
    if ('modality' in data) {
      updateData.modalidad = data.modality;
    }
    if ('displayOrder' in data) {
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
