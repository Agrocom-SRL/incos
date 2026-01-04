import { Permission } from '../../domain/entities/Permission.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: PermissionMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Permission)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Permission
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Permission
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Permission (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + PermissionMapper (campos específicos)
 * - Infrastructure Layer: PermissionRepository (usa el mapper para conversiones)
 */
export class PermissionMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Permission
   * 
   * @param {Object|null} model - Modelo Sequelize de Permiso
   * @returns {Permission|null} Entidad de dominio Permission
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Permission (campos del dominio)
    const specificFields = {
      code: model.codigo,
      module: model.modulo,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Permission(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Permission|Object} entity - Entidad Permission o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Permission como objeto plano
    const data = entity instanceof Permission ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      codigo: data.code,
      modulo: data.module,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Permission
   * 
   * @param {Permission|Object} entity - Entidad Permission o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Permission como objeto plano
    const data = entity instanceof Permission ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Permission
    if (data.code !== undefined) {
      updateData.codigo = data.code;
    }
    if (data.module !== undefined) {
      updateData.modulo = data.module;
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
   * @returns {Permission[]} Array de entidades Permission
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

