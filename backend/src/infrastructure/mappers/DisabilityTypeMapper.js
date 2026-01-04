import { DisabilityType } from '../../domain/entities/DisabilityType.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: DisabilityTypeMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (DisabilityType)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de DisabilityType
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de DisabilityType
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: DisabilityType (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + DisabilityTypeMapper (campos específicos)
 * - Infrastructure Layer: DisabilityTypeRepository (usa el mapper para conversiones)
 */
export class DisabilityTypeMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de DisabilityType
   * 
   * @param {Object|null} model - Modelo Sequelize de TipoDiscapacidad
   * @returns {DisabilityType|null} Entidad de dominio DisabilityType
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de DisabilityType (campos del dominio)
    const specificFields = {
      name: model.nombre,
      description: model.descripcion,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new DisabilityType(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {DisabilityType|Object} entity - Entidad DisabilityType o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad DisabilityType como objeto plano
    const data = entity instanceof DisabilityType ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      nombre: data.name,
      descripcion: data.description || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de DisabilityType
   * 
   * @param {DisabilityType|Object} entity - Entidad DisabilityType o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad DisabilityType como objeto plano
    const data = entity instanceof DisabilityType ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de DisabilityType
    if (data.name !== undefined) {
      updateData.nombre = data.name;
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
   * @returns {DisabilityType[]} Array de entidades DisabilityType
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

