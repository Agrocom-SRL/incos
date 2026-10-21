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
   * IMPORTANTE: Cuando se usan attributes limitados, Sequelize almacena los campos solicitados
   * en model.dataValues. Este método accede a dataValues para obtener solo los campos
   * que fueron solicitados explícitamente.
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {Object|null} Objeto con campos base para la entidad (solo campos presentes)
   */
  static extractBaseFields(model) {
    if (!model) return null;

    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const baseFields = {};

    // Solo incluir campos que existen en dataValues (campos solicitados explícitamente)
    if ('id' in dataValues && dataValues.id !== undefined) {
      baseFields.id = dataValues.id;
    }
    if ('activo' in dataValues && dataValues.activo !== undefined) {
      baseFields.active = dataValues.activo;
    }
    if ('createdAt' in dataValues && dataValues.createdAt !== undefined) {
      baseFields.createdAt = dataValues.createdAt;
    }
    if ('updatedAt' in dataValues && dataValues.updatedAt !== undefined) {
      baseFields.updatedAt = dataValues.updatedAt;
    }
    if ('deletedAt' in dataValues && dataValues.deletedAt !== undefined) {
      baseFields.deletedAt = dataValues.deletedAt;
    }
    if ('createdBy' in dataValues && dataValues.createdBy !== undefined) {
      baseFields.createdBy = dataValues.createdBy;
    }
    if ('updatedBy' in dataValues && dataValues.updatedBy !== undefined) {
      baseFields.updatedBy = dataValues.updatedBy;
    }
    if ('deletedBy' in dataValues && dataValues.deletedBy !== undefined) {
      baseFields.deletedBy = dataValues.deletedBy;
    }

    return baseFields;
  }

  /**
   * Convierte campos base de la entidad a formato del modelo ORM (para creación)
   *
   * NOTA: Este método retorna un objeto vacío porque BaseRepository.create() maneja:
   * - activo: Lo establece con data.activo !== undefined ? data.activo : true
   * - createdBy: Lo establece con el userId proporcionado
   *
   * Este método existe para mantener simetría con baseFieldsToModelForUpdate()
   * y para permitir extensiones futuras si se necesitan campos base adicionales.
   *
   * @param {BaseEntity|Object} entity - Entidad o objeto con datos
   * @returns {Object} Objeto con campos base para el modelo ORM (actualmente vacío)
   */
  static baseFieldsToModel(_entity) {
    // activo NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    // Los campos de auditoría (createdBy, updatedBy, deletedBy) los maneja BaseRepository
    return {};
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
   * @returns {Object|null} Objeto combinado para crear la entidad
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
