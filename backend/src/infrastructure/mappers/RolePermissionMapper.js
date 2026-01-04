import { RolePermission } from '../../domain/entities/RolePermission.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: RolePermissionMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (RolePermission)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de RolePermission
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de RolePermission
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: RolePermission (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + RolePermissionMapper (campos específicos)
 * - Infrastructure Layer: RolePermissionRepository (usa el mapper para conversiones)
 */
export class RolePermissionMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de RolePermission
   * 
   * @param {Object|null} model - Modelo Sequelize de RolPermiso
   * @returns {RolePermission|null} Entidad de dominio RolePermission
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de RolePermission (campos del dominio)
    const specificFields = {
      roleId: model.rolId,
      permissionId: model.permisoId,
      action: model.accion,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new RolePermission(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {RolePermission|Object} entity - Entidad RolePermission o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad RolePermission como objeto plano
    const data = entity instanceof RolePermission ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      rolId: data.roleId,
      permisoId: data.permissionId,
      accion: data.action,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de RolePermission
   * 
   * @param {RolePermission|Object} entity - Entidad RolePermission o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad RolePermission como objeto plano
    const data = entity instanceof RolePermission ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de RolePermission
    if (data.roleId !== undefined) {
      updateData.rolId = data.roleId;
    }
    if (data.permissionId !== undefined) {
      updateData.permisoId = data.permissionId;
    }
    if (data.action !== undefined) {
      updateData.accion = data.action;
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
   * @returns {RolePermission[]} Array de entidades RolePermission
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

