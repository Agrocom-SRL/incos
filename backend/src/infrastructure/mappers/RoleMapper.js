import { Role } from '../../domain/entities/Role.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: RoleMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Role)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Role
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Role
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Role (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + RoleMapper (campos específicos)
 * - Infrastructure Layer: RoleRepository (usa el mapper para conversiones)
 */
export class RoleMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Role
   * 
   * @param {Object|null} model - Modelo Sequelize de Rol
   * @returns {Role|null} Entidad de dominio Role
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Role (campos del dominio)
    const specificFields = {
      code: model.codigo,
      name: model.nombre,
      accessLevel: model.nivelAcceso,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Role(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Role|Object} entity - Entidad Role o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Role como objeto plano
    const data = entity instanceof Role ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      codigo: data.code,
      nombre: data.name,
      nivelAcceso: data.accessLevel !== undefined ? data.accessLevel : 1,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Role
   * 
   * @param {Role|Object} entity - Entidad Role o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Role como objeto plano
    const data = entity instanceof Role ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Role
    if (data.code !== undefined) {
      updateData.codigo = data.code;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.accessLevel !== undefined) {
      updateData.nivelAcceso = data.accessLevel;
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
   * @returns {Role[]} Array de entidades Role
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

