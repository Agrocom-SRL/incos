import { BaseEntity } from '../../domain/entities/BaseEntity.js';

/**
 * Mapper Base: BaseMapper
 * 
 * Responsabilidad: Factoriza la conversión de campos comunes entre Modelo ORM ↔ Entidad Base
 * 
 * Campos comunes (heredados de BaseEntity/baseModel):
 * - id, activo/active, createdAt, updatedAt, deletedAt
 * - createdBy, updatedBy, deletedBy
 * 
 * Ubicación: Infrastructure Layer
 * 
 * Patrón: Template Method
 * - Métodos template manejan campos comunes
 * - Métodos abstractos permiten personalización de campos específicos
 */
export class BaseMapper {
  /**
   * Extrae los campos base del modelo ORM para crear una entidad
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Object} Objeto con campos base para la entidad (solo campos presentes)
   */
  static extractBaseFields(model) {
    if (!model) return null;

    const baseFields = {};
    
    // Solo incluir campos que existen en el modelo (no undefined)
    // Esto es importante cuando se usan attributes limitados en las consultas
    if (model.id !== undefined) baseFields.id = model.id;
    if (model.activo !== undefined) baseFields.active = model.activo;
    if (model.createdAt !== undefined) baseFields.createdAt = model.createdAt;
    if (model.updatedAt !== undefined) baseFields.updatedAt = model.updatedAt;
    if (model.deletedAt !== undefined) baseFields.deletedAt = model.deletedAt;
    if (model.createdBy !== undefined) baseFields.createdBy = model.createdBy;
    if (model.updatedBy !== undefined) baseFields.updatedBy = model.updatedBy;
    if (model.deletedBy !== undefined) baseFields.deletedBy = model.deletedBy;

    return baseFields;
  }

  /**
   * Convierte campos base de la entidad a formato del modelo ORM (para creación)
   * 
   * @param {BaseEntity|Object} entity - Entidad o objeto con datos
   * @returns {Object} Objeto con campos base para el modelo ORM
   */
  static baseFieldsToModel(entity) {
    const data = entity instanceof BaseEntity ? entity.toPlainObject() : entity;

    return {
      // activo NO se incluye aquí porque BaseRepository.create() lo maneja
      // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
      // Los campos de auditoría (createdBy, updatedBy, deletedBy) los maneja BaseRepository
    };
  }

  /**
   * Convierte campos base de la entidad a formato del modelo ORM (para actualización)
   * Solo incluye campos definidos
   * 
   * @param {BaseEntity|Object} entity - Entidad o objeto con datos
   * @returns {Object} Objeto con campos base para actualización
   */
  static baseFieldsToModelForUpdate(entity) {
    const data = entity instanceof BaseEntity ? entity.toPlainObject() : entity;
    const updateData = {};

    // Por compatibilidad, aceptamos tanto 'activo' como 'active'
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    } else if (data.active !== undefined) {
      updateData.activo = data.active;
    }

    // Los campos de auditoría (updatedBy) los maneja BaseRepository.update()

    return updateData;
  }

  /**
   * Combina campos base con campos específicos para crear una entidad
   * Helper method para usar en mappers específicos
   * 
   * @param {Object} model - Modelo Sequelize
   * @param {Object} specificFields - Campos específicos de la entidad
   * @returns {Object} Objeto combinado para crear la entidad
   */
  static combineBaseAndSpecificFields(model, specificFields) {
    const baseFields = this.extractBaseFields(model);
    if (!baseFields) return null;

    return {
      ...baseFields,
      ...specificFields,
    };
  }
}

