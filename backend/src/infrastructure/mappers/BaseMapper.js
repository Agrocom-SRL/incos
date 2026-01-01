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
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Object} Objeto con campos base para la entidad
   */
  static extractBaseFields(model) {
    if (!model) return null;

    return {
      id: model.id,
      active: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
      createdBy: model.createdBy,
      updatedBy: model.updatedBy,
      deletedBy: model.deletedBy,
    };
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

