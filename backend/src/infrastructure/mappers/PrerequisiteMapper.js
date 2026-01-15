import { Prerequisite } from '../../domain/entities/Prerequisite.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: PrerequisiteMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Prerequisite)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Prerequisite
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Prerequisite
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Prerequisite (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + PrerequisiteMapper (campos específicos)
 * - Infrastructure Layer: PrerequisiteRepository (usa el mapper para conversiones)
 */
export class PrerequisiteMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Prerequisite
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de Prerrequisito
   * @returns {Prerequisite|null} Entidad de dominio Prerequisite
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Prerequisite (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('planEstudioId' in dataValues && dataValues.planEstudioId !== undefined) {
      specificFields.studyPlanId = dataValues.planEstudioId ?? null;
    }
    if ('asignaturaId' in dataValues && dataValues.asignaturaId !== undefined) {
      specificFields.subjectId = dataValues.asignaturaId ?? null;
    }
    if ('prerrequisitoId' in dataValues && dataValues.prerrequisitoId !== undefined) {
      specificFields.prerequisiteId = dataValues.prerrequisitoId ?? null;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Prerequisite(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {Prerequisite|Object} entity - Entidad Prerequisite o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Prerequisite como objeto plano
    const data = entity instanceof Prerequisite ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      planEstudioId: data.studyPlanId ?? null,
      asignaturaId: data.subjectId ?? null,
      prerrequisitoId: data.prerequisiteId ?? null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Prerequisite
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {Prerequisite|Object} entity - Entidad Prerequisite o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Prerequisite como objeto plano
    const data = entity instanceof Prerequisite ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Prerequisite
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studyPlanId' in data) {
      updateData.planEstudioId = data.studyPlanId ?? null;
    }
    if ('subjectId' in data) {
      updateData.asignaturaId = data.subjectId ?? null;
    }
    if ('prerequisiteId' in data) {
      updateData.prerrequisitoId = data.prerequisiteId ?? null;
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
   * @returns {Prerequisite[]} Array de entidades Prerequisite
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

