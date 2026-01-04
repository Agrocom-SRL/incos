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
   * 
   * @param {Object|null} model - Modelo Sequelize de Prerrequisito
   * @returns {Prerequisite|null} Entidad de dominio Prerequisite
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Prerequisite (campos del dominio)
    const specificFields = {
      subjectId: model.materiaId,
      prerequisiteSubjectId: model.materiaPrerrequisitoId,
      description: model.descripcion,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Prerequisite(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Prerequisite|Object} entity - Entidad Prerequisite o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Prerequisite como objeto plano
    const data = entity instanceof Prerequisite ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      materiaId: data.subjectId || null,
      materiaPrerrequisitoId: data.prerequisiteSubjectId || null,
      descripcion: data.description || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Prerequisite
   * 
   * @param {Prerequisite|Object} entity - Entidad Prerequisite o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Prerequisite como objeto plano
    const data = entity instanceof Prerequisite ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Prerequisite
    if (data.subjectId !== undefined) {
      updateData.materiaId = data.subjectId || null;
    }
    if (data.prerequisiteSubjectId !== undefined) {
      updateData.materiaPrerrequisitoId = data.prerequisiteSubjectId || null;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
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

