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
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de ConfiguracionSistema
   * @returns {SystemConfiguration|null} Entidad de dominio SystemConfiguration
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de SystemConfiguration (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('clave' in dataValues && dataValues.clave !== undefined) {
      specificFields.key = dataValues.clave;
    }
    if ('valor' in dataValues && dataValues.valor !== undefined) {
      specificFields.value = dataValues.valor;
    }
    if ('tipo' in dataValues && dataValues.tipo !== undefined) {
      specificFields.type = dataValues.tipo;
    }
    if ('descripcion' in dataValues && dataValues.descripcion !== undefined) {
      specificFields.description = dataValues.descripcion;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new SystemConfiguration(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {SystemConfiguration|Object} entity - Entidad SystemConfiguration o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad SystemConfiguration como objeto plano
    const data = entity instanceof SystemConfiguration ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      clave: data.key,
      valor: data.value,
      tipo: data.type || 'STRING',
      descripcion: data.description || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de SystemConfiguration
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {SystemConfiguration|Object} entity - Entidad SystemConfiguration o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad SystemConfiguration como objeto plano
    const data = entity instanceof SystemConfiguration ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de SystemConfiguration
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    // NOTA: 'clave' (key) normalmente no se actualiza, es único e inmutable
    if ('value' in data) {
      updateData.valor = data.value;
    }
    if ('type' in data) {
      updateData.tipo = data.type;
    }
    if ('description' in data) {
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

