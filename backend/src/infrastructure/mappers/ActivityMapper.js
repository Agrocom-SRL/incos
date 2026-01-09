import { Activity } from '../../domain/entities/Activity.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: ActivityMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Activity)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Activity
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Activity
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Activity (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + ActivityMapper (campos específicos)
 * - Infrastructure Layer: ActivityRepository (usa el mapper para conversiones)
 */
export class ActivityMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Activity
   * 
   * @param {Object|null} model - Modelo Sequelize de Actividad
   * @returns {Activity|null} Entidad de dominio Activity
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Activity (campos del dominio)
    const specificFields = {
      name: model.nombre,
      description: model.descripcion ?? null,
      type: model.tipo ?? null,
      isHighlighted: Boolean(model.esDestacada),
      icon: model.icono ?? null,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Activity(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Activity|Object} entity - Entidad Activity o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Activity como objeto plano
    const data = entity instanceof Activity ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      nombre: data.name,
      descripcion: data.description ?? null,
      tipo: data.type ?? null,
      esDestacada: data.isHighlighted !== undefined ? data.isHighlighted : false,
      icono: data.icon ?? null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Activity
   * 
   * @param {Activity|Object} entity - Entidad Activity o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Activity como objeto plano
    const data = entity instanceof Activity ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Activity
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description ?? null;
    }
    if (data.type !== undefined) {
      updateData.tipo = data.type ?? null;
    }
    if (data.isHighlighted !== undefined) {
      updateData.esDestacada = data.isHighlighted;
    }
    if (data.icon !== undefined) {
      updateData.icono = data.icon ?? null;
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
   * @returns {Activity[]} Array de entidades Activity
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
