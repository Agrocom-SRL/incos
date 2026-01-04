import { SystemConfiguration } from '../../domain/entities/SystemConfiguration.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: SystemConfigurationMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (SystemConfiguration)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de SystemConfiguration
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de SystemConfiguration
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: SystemConfiguration (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + SystemConfigurationMapper (campos específicos)
 * - Infrastructure Layer: ConfiguracionSistemaRepository (usa el mapper para conversiones)
 */
export class SystemConfigurationMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de SystemConfiguration
   * 
   * @param {Object|null} model - Modelo Sequelize de ConfiguracionSistema
   * @returns {SystemConfiguration|null} Entidad de dominio SystemConfiguration
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de SystemConfiguration (campos del dominio)
    const specificFields = {
      key: model.clave,
      value: model.valor,
      type: model.tipo,
      description: model.descripcion,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new SystemConfiguration(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {SystemConfiguration|Object} entity - Entidad SystemConfiguration o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad SystemConfiguration como objeto plano
    const data = entity instanceof SystemConfiguration ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      clave: data.key,
      valor: data.value,
      tipo: data.type || 'STRING',
      descripcion: data.description || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de SystemConfiguration
   * 
   * @param {SystemConfiguration|Object} entity - Entidad SystemConfiguration o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad SystemConfiguration como objeto plano
    const data = entity instanceof SystemConfiguration ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de SystemConfiguration
    // NOTA: 'clave' (key) normalmente no se actualiza, es único e inmutable
    if (data.value !== undefined) {
      updateData.valor = data.value;
    }
    if (data.type !== undefined) {
      updateData.tipo = data.type;
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
   * @returns {SystemConfiguration[]} Array de entidades SystemConfiguration
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

