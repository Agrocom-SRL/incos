import { Country } from '../../domain/entities/Country.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: CountryMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Country)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Country
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Country
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Country (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + CountryMapper (campos específicos)
 * - Infrastructure Layer: CountryRepository (usa el mapper para conversiones)
 */
export class CountryMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Country
   * 
   * @param {Object|null} model - Modelo Sequelize de Pais
   * @returns {Country|null} Entidad de dominio Country
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Country (campos del dominio)
    const specificFields = {
      name: model.nombre,
      isoCode: model.codigoIso,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Country(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Country|Object} entity - Entidad Country o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Country como objeto plano
    const data = entity instanceof Country ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      nombre: data.name,
      codigoIso: data.isoCode ? data.isoCode.toUpperCase() : null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Country
   * 
   * @param {Country|Object} entity - Entidad Country o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Country como objeto plano
    const data = entity instanceof Country ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Country
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.isoCode !== undefined) {
      updateData.codigoIso = data.isoCode.toUpperCase();
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
   * @returns {Country[]} Array de entidades Country
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

