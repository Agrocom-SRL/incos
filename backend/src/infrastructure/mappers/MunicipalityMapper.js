import { Municipality } from '../../domain/entities/Municipality.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: MunicipalityMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Municipality)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Municipality
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Municipality
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Municipality (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + MunicipalityMapper (campos específicos)
 * - Infrastructure Layer: MunicipalityRepository (usa el mapper para conversiones)
 */
export class MunicipalityMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Municipality
   * 
   * @param {Object|null} model - Modelo Sequelize de Municipio
   * @returns {Municipality|null} Entidad de dominio Municipality
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Municipality (campos del dominio)
    const specificFields = {
      provinceId: model.provinciaId,
      name: model.nombre,
      code: model.codigo,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Municipality(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Municipality|Object} entity - Entidad Municipality o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Municipality como objeto plano
    const data = entity instanceof Municipality ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      provinciaId: data.provinceId,
      nombre: data.name,
      codigo: data.code ? data.code.toUpperCase() : null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Municipality
   * 
   * @param {Municipality|Object} entity - Entidad Municipality o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Municipality como objeto plano
    const data = entity instanceof Municipality ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Municipality
    if (data.provinceId !== undefined) {
      updateData.provinciaId = data.provinceId;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.code !== undefined) {
      updateData.codigo = data.code ? data.code.toUpperCase() : null;
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
   * @returns {Municipality[]} Array de entidades Municipality
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

